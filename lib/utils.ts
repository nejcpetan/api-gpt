import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: number) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  }).format(new Date(date))
}

export function groupChatsByMonth(chats: Chat[]) {
  const grouped = chats.reduce((acc, chat) => {
    const monthYear = formatDate(chat.createdAt)
    if (!acc[monthYear]) {
      acc[monthYear] = []
    }
    acc[monthYear].push(chat)
    return acc
  }, {} as Record<string, Chat[]>)

  // Sort chats within each month by date (newest first)
  Object.values(grouped).forEach(monthChats => {
    monthChats.sort((a, b) => b.createdAt - a.createdAt)
  })

  // Sort months (newest first)
  return Object.entries(grouped)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
}
