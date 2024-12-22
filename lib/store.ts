import { create } from 'zustand'
import { Chat, Message } from '@/types/chat'
import { nanoid } from 'nanoid'

interface ChatStore {
  chats: Chat[]
  currentChat: string | null
  selectedModel: string
  loadChats: () => Promise<void>
  saveChat: (chat: Chat) => Promise<void>
  addChat: () => string
  addMessage: (message: Omit<Message, 'id' | 'createdAt'>) => string
  updateMessage: (id: string, content: string, shouldSave?: boolean) => void
  setCurrentChat: (id: string) => void
  deleteChat: (id: string) => void
  getCurrentChat: () => Chat | undefined
  updateChatTitle: (id: string, title: string) => void
}

export const useChatStore = create<ChatStore>()((set, get) => ({
  chats: [],
  currentChat: null,
  selectedModel: "gpt-4o-mini",

  // Load chats from file system
  loadChats: async () => {
    try {
      const response = await fetch('/api/chats')
      if (!response.ok) throw new Error('Failed to load chats')
      const chats = await response.json()
      console.log('Loaded chats:', chats)
      set({ chats })
    } catch (error) {
      console.error('Failed to load chats:', error)
    }
  },

  // Save chat to file system
  saveChat: async (chat) => {
    try {
      await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chat)
      })
    } catch (error) {
      console.error('Failed to save chat:', error)
    }
  },

  addChat: () => {
    const newChat = {
      id: nanoid(),
      title: '',
      messages: [],
      createdAt: Date.now(),
    }
    set((state) => ({
      chats: [newChat, ...state.chats],
      currentChat: newChat.id,
    }))
    get().saveChat(newChat)
    return newChat.id
  },

  addMessage: (message) => {
    const id = nanoid()
    set((state) => {
      const currentChat = state.currentChat
      if (!currentChat) return state

      const updatedChats = state.chats.map((chat) => {
        if (chat.id === currentChat) {
          const newMessages = [
            ...chat.messages,
            {
              ...message,
              id,
              createdAt: Date.now(),
            },
          ]

          const userMessageCount = newMessages.filter(m => m.role === 'user').length
          const shouldGenerateTitle = userMessageCount === 3 && !chat.title

          const updatedChat = {
            ...chat,
            messages: newMessages,
            // Only use first message as title if no title and first user message
            title: (!chat.title && message.role === 'user' && userMessageCount === 1) 
              ? message.content.substring(0, 30) 
              : chat.title
          }

          // Generate title after exactly 3 user messages
          if (shouldGenerateTitle) {
            console.log('Generating title for chat:', chat.id) // Debug log
            generateChatName(newMessages).then(title => {
              console.log('Generated title:', title) // Debug log
              get().updateChatTitle(chat.id, title)
            })
          }
          
          get().saveChat(updatedChat)
          return updatedChat
        }
        return chat
      })

      return { chats: updatedChats }
    })
    return id
  },

  updateMessage: (id: string, content: string, shouldSave = true) => {
    set((state) => {
      const updatedChats = state.chats.map((chat) => {
        const newChat = {
          ...chat,
          messages: chat.messages.map((msg) =>
            msg.id === id ? { ...msg, content } : msg
          ),
        }
        // Only save if shouldSave is true
        if (shouldSave && chat.messages.some(msg => msg.id === id)) {
          get().saveChat(newChat)
        }
        return newChat
      })
      return { chats: updatedChats }
    })
  },

  setCurrentChat: (id) => set({ currentChat: id }),

  deleteChat: async (id) => {
    try {
      await fetch(`/api/chats/${id}`, { method: 'DELETE' })
      set((state) => ({
        chats: state.chats.filter((chat) => chat.id !== id),
        currentChat: state.chats[0]?.id ?? null,
      }))
    } catch (error) {
      console.error('Failed to delete chat:', error)
    }
  },

  getCurrentChat: () => {
    const state = get()
    return state.chats.find(chat => chat.id === state.currentChat)
  },

  updateChatTitle: (id: string, title: string) => {
    set((state) => {
      const updatedChats = state.chats.map((chat) => {
        if (chat.id === id) {
          const updatedChat = {
            ...chat,
            title
          }
          get().saveChat(updatedChat)
          return updatedChat
        }
        return chat
      })
      return { chats: updatedChats }
    })
  },
})) 

// Add this helper function
const generateChatName = async (messages: Message[]): Promise<string> => {
  try {
    const userMessages = messages
      .filter(m => m.role === 'user')
      .slice(0, 3)
      .map(m => m.content)
      .join('\n')

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Generate a concise chat title (max 40 chars) based on the conversation topics. Output ONLY the title text with no quotes or additional text.'
          },
          {
            role: 'user',
            content: userMessages
          }
        ],
        model: 'gpt-4o-mini'
      })
    })

    if (!response.ok) throw new Error('Failed to generate title')
    
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let title = ''

    if (!reader) return 'New Chat'

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      title += decoder.decode(value)
    }

    return title.trim()
  } catch (error) {
    console.error('Failed to generate title:', error)
    return 'New Chat'
  }
} 