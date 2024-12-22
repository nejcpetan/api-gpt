"use client"

import { useState, useRef, useEffect, memo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SendIcon, UserIcon, Loader2, Zap, PlusIcon, Check, Copy, Paperclip, Globe, Mic, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/lib/store'
import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AVAILABLE_MODELS, type ModelId } from '@/lib/constants'
import { AiLogo } from '@/components/icons/ai-logo'
import { ScrollArea } from "@/components/ui/scroll-area"
import { useVirtualizer } from '@tanstack/react-virtual'
import debounce from 'lodash.debounce'
import { useSettingsStore } from '@/lib/settingsStore'
import { SettingsButton } from '@/components/settings-button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const CodeBlock = ({ language, code }: { language: string, code: string }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const customTheme = {
    'pre[class*="language-"]': {
      background: 'transparent',
      margin: 0,
    },
    'code[class*="language-"]': {
      background: 'transparent',
    },
    comment: { color: '#6A9955' },
    string: { color: '#CE9178' },
    keyword: { color: '#569CD6' },
    function: { color: '#DCDCAA' },
    number: { color: '#B5CEA8' },
    operator: { color: '#D4D4D4' },
    punctuation: { color: '#D4D4D4' },
    class: { color: '#4EC9B0' },
    variable: { color: '#9CDCFE' },
    property: { color: '#9CDCFE' },
    parameter: { color: '#9CDCFE' },
    'class-name': { color: '#4EC9B0' },
    'function-name': { color: '#DCDCAA' },
  }

  return (
    <div className="relative my-3 sm:my-4 first:mt-0 last:mb-0 rounded-lg sm:rounded-xl overflow-hidden bg-[#2A2A2A] border border-white/10">
      <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 bg-[#2B2B2B] border-b border-white/10">
        <div className="text-xs text-gray-400 font-mono uppercase">
          {language}
        </div>
        <button
          onClick={copyToClipboard}
          className="text-gray-400 hover:text-gray-300 transition-colors"
        >
          {copied ? (
            <div className="flex items-center gap-1 text-xs">
              <Check className="h-4 w-4" />
              <span>Copied!</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs">
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </div>
          )}
        </button>
      </div>
      <div className="p-3 sm:p-4">
        <SyntaxHighlighter
          style={customTheme}
          language={language}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: 0,
            background: 'transparent',
            fontSize: '13px',
            lineHeight: '1.5',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

const ChatMessage = memo(({ message, isThinking, style }: { 
  message: Message, 
  isThinking?: boolean,
  style?: React.CSSProperties 
}) => {
  return (
    <div style={style} className="px-2 sm:px-4 py-2 sm:py-3">
      <div className="max-w-3xl mx-auto flex gap-3 sm:gap-6">
        {message.role === "assistant" ? (
          <>
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
              <AvatarFallback className="bg-[#10A37F] text-white">
                <AiLogo />
              </AvatarFallback>
            </Avatar>
            <div className="prose prose-invert max-w-none flex-1 bg-transparent leading-relaxed prose-sm sm:prose-base">
              {isThinking ? (
                <div className="text-gray-400 flex items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm sm:text-[15px]">Thinking</span>
                    <span className="animate-pulse">.</span>
                    <span className="animate-pulse delay-200">.</span>
                    <span className="animate-pulse delay-400">.</span>
                  </div>
                </div>
              ) : (
                <MemoizedMarkdown content={message.content} />
              )}
            </div>
          </>
        ) : (
          <div className="flex gap-3 sm:gap-6 w-full justify-end">
            <div className="max-w-[90%] sm:max-w-[85%]">
              <div className="bg-[#343541] rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-[15px] leading-6 sm:leading-7">
                {message.content}
              </div>
            </div>
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
              <AvatarFallback className="bg-gray-600 text-gray-300 ring-1 ring-gray-500">
                <UserIcon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </div>
  )
})
ChatMessage.displayName = 'ChatMessage'

const MemoizedMarkdown = memo(({ content }: { content: string }) => (
  <Markdown
    components={{
      p: ({ children }) => (
        <p className="mb-4 sm:mb-6 last:mb-0 text-sm sm:text-[15px] leading-6 sm:leading-7 font-light text-gray-300">
          {children}
        </p>
      ),
      ul: ({ children }) => (
        <ul className="mb-4 sm:mb-6 space-y-1 pl-4 sm:pl-5">
          {children}
        </ul>
      ),
      li: ({ children }) => (
        <li className="text-sm sm:text-[15px] leading-6 sm:leading-7 font-medium text-gray-200 list-disc marker:text-gray-500">
          <span>{children}</span>
        </li>
      ),
      code({ node, inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '')
        if (!inline && match) {
          return (
            <div className="my-6">
              <CodeBlock 
                language={match[1]} 
                code={String(children).replace(/\n$/, '')} 
              />
            </div>
          )
        }
        return (
          <code {...props} className="bg-gray-800 px-1.5 py-0.5 rounded text-[13px]">
            {children}
          </code>
        )
      }
    }}
  >
    {content}
  </Markdown>
))
MemoizedMarkdown.displayName = 'MemoizedMarkdown'

export default function Chat() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { currentChat, addMessage, chats, updateMessage, loadChats, setCurrentChat, addChat } = useChatStore()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [fileId, setFileId] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<ModelId>("gpt-4o-mini")
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const { hasApiKey } = useSettingsStore()
  const [showApiKeyReminder, setShowApiKeyReminder] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  
  const currentMessages = chats.find(chat => chat.id === currentChat)?.messages || []

  const loadChatsStable = useCallback(async () => {
    await loadChats()
  }, [])

  useEffect(() => {
    loadChatsStable()
  }, [loadChatsStable])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    const apiKey = useSettingsStore.getState().apiKey
    if (!apiKey) {
      setShowApiKeyReminder(true)
      return
    }

    if ((!input.trim() && !fileId) || isLoading) return

    if (!currentChat) {
      const newChatId = addChat()
      setCurrentChat(newChatId)
    }

    const userMessage = {
      content: input,
      role: 'user' as const,
    }

    setIsLoading(true)
    setInput('')
    setIsThinking(true)

    textareaRef.current?.focus()

    addMessage(userMessage)
    const assistantMessageId = addMessage({
      content: '',
      role: 'assistant',
    })

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...currentMessages, userMessage].map(({ role, content }) => ({
            role,
            content,
          })),
          fileId: fileId,
          model: selectedModel,
          apiKey: apiKey,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }
      
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) return

      let content = ''
      setIsThinking(false)
      
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        content += chunk
        updateMessage(assistantMessageId, content, false)
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }

      const currentChat = useChatStore.getState().getCurrentChat()
      if (currentChat) {
        await useChatStore.getState().saveChat(currentChat)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
      setIsThinking(false)
      setFileId(null)
      setSelectedFile(null)
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages])

  // Debounce textarea resize
  const debouncedResize = useCallback(
    debounce(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'inherit'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }
    }, 100),
    []
  )

  useEffect(() => {
    debouncedResize()
  }, [input, debouncedResize])

  const uploadFile = async (file: File) => {
    setUploadingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setFileId(data.fileId)
      
      addMessage({
        content: `Uploaded file: ${file.name}`,
        role: 'system',
      })
    } catch (error) {
      console.error('Error uploading file:', error)
      setSelectedFile(null)
      alert(error instanceof Error ? error.message : 'Failed to upload file. Please try again.')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      await uploadFile(file)
    }
  }

  const ModelSelector = () => {
    return (
      <div className="relative z-50">
        <button
          type="button"
          onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
          className="flex items-center gap-1 px-2 py-1 text-sm text-gray-400 hover:text-gray-300 transition-colors rounded-full"
        >
          {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </button>

        {isModelMenuOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsModelMenuOpen(false)}
            />
            <div 
              className="absolute bottom-[calc(100%+0.5rem)] left-0 w-48 bg-[#1E1E1E] rounded-2xl shadow-lg border border-white/10 z-50"
            >
              {AVAILABLE_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id)
                    setIsModelMenuOpen(false)
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/5",
                    model.id === selectedModel ? "text-[#19c37d]" : "text-gray-300"
                  )}
                >
                  {model.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  const rowVirtualizer = useVirtualizer({
    count: currentMessages.length,
    getScrollElement: () => messagesEndRef.current,
    estimateSize: () => 100, // Estimate average message height
    overscan: 5
  })

  // Keep focus when component mounts or chat changes
  useEffect(() => {
    textareaRef.current?.focus()
  }, [currentChat])

  return (
    <div className="relative flex flex-col h-[100vh] max-h-[100vh] overflow-hidden bg-[#171717]">
      {!currentChat ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-4 pb-28">
          <div className="w-full max-w-[48rem] space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl sm:text-4xl font-semibold text-gray-200">
                API GPT
              </h1>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4" />
                  {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-[#2A2A2A] rounded-2xl border border-white/10 p-4 sm:p-6 max-w-xl mx-auto">
              <div className="space-y-4">
                <p className="text-gray-300 text-sm leading-relaxed">
                  API GPT is a local chat interface that connects directly to OpenAI's API, allowing you to use premium models like o1-preview without a ChatGPT Plus subscription.
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Instead of a monthly subscription, you only pay for what you use through OpenAI's pay-as-you-go API pricing. Your chat history is stored locally.
                </p>
                <div className="pt-2">
                  <p className="text-gray-400 text-sm">
                    Start chatting by typing a message or uploading a file.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="sticky top-0 h-24 bg-gradient-to-b from-[#171717] via-[#171717]/90 to-transparent z-10" />
          <div className="flex flex-col">
            <div className="h-4" />
            {currentMessages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                isThinking={isThinking && message.role === 'assistant' && message === currentMessages[currentMessages.length - 1]} 
              />
            ))}
            <div ref={messagesEndRef} className="h-48 shrink-0" />
          </div>
        </ScrollArea>
      )}

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0">
        {/* Dark gradient background */}
        <div className="absolute inset-0 h-40 bg-gradient-to-t from-[#171717] via-[#171717]/90 to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative mx-auto max-w-3xl px-2 sm:px-4 pb-4 sm:pb-8">
          {/* Input container */}
          <div className="relative bg-[#2f2f2f] rounded-xl sm:rounded-2xl shadow-lg border border-white/10">
            <form onSubmit={handleSubmit} className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                placeholder={`Message ${AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}`}
                className="min-h-[52px] max-h-[200px] w-full resize-none bg-transparent border-0 rounded-xl sm:rounded-2xl pr-12 pl-3 sm:pl-4 pt-3 sm:pt-4 pb-12 sm:pb-14 text-white/90 text-[14px] font-light placeholder:text-gray-400 focus:outline-none focus:ring-0"
                rows={1}
              />
              
              {/* Bottom controls - no border, no separator */}
              <div className="absolute bottom-0 left-0 right-0 h-10 sm:h-12 px-2 sm:px-3 flex justify-between items-center">
                {/* Left side controls */}
                <div className="flex items-center gap-2 text-gray-400">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1 hover:text-gray-200 transition-colors"
                    disabled={uploadingFile}
                  >
                    {uploadingFile ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="h-4 w-4" />
                    )}
                  </button>
                  <ModelSelector />
                </div>

                {/* Right side send button */}
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="text-gray-400 hover:text-gray-200 disabled:hover:text-gray-400 disabled:opacity-40"
                  variant="ghost"
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SendIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* File indicator and info text */}
          <div className="mt-2 flex flex-col items-center gap-1.5">
            {selectedFile && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Paperclip className="h-3 w-3" />
                <span>{selectedFile.name}</span>
                {uploadingFile ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <button
                    onClick={() => {
                      setSelectedFile(null)
                      setFileId(null)
                    }}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    ×
                  </button>
                )}
              </div>
            )}
            
            <div className="text-center text-xs text-gray-500">
              AI can make mistakes. Consider checking important information.
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showApiKeyReminder} onOpenChange={setShowApiKeyReminder}>
        <DialogContent className="bg-[#1E1E1E] border-white/10 text-gray-200">
          <DialogHeader>
            <DialogTitle>API Key Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-300">
              Please set up your OpenAI API key in settings before starting a chat.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setShowApiKeyReminder(false)}
                variant="ghost"
                className="text-gray-400 hover:text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowApiKeyReminder(false)
                  setSettingsOpen(true)
                }}
                className="bg-[#10A37F] hover:bg-[#0E906F] text-white transition-colors"
              >
                Set API Key
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SettingsButton 
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  )
} 