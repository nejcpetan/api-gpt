export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  createdAt: number
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: number
} 