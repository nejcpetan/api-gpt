import Chat from "@/components/chat"
import Sidebar from "@/components/sidebar"
import { Trash2 } from 'lucide-react'
import { formatDate, groupChatsByMonth } from '@/lib/utils'

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <Chat />
      </main>
    </div>
  )
}
