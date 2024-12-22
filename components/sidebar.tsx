"use client"

import { useState } from 'react'
import { useChatStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { PanelRight, PenSquare, Trash2, Check, X, Edit2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { SettingsButton } from '@/components/settings-button'

interface EditingState {
  id: string | null
  title: string
}

export default function Sidebar() {
  const { chats, currentChat, setCurrentChat, deleteChat } = useChatStore()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [editing, setEditing] = useState<EditingState>({ id: null, title: '' })
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleEditStart = (chat: Chat) => {
    setEditing({ id: chat.id, title: chat.title || chat.messages[0]?.content.substring(0, 30) || 'New Chat' })
  }

  const handleEditSave = () => {
    if (editing.id && editing.title.trim()) {
      updateChatTitle(editing.id, editing.title.trim())
      setEditing({ id: null, title: '' })
    }
  }

  const handleEditCancel = () => {
    setEditing({ id: null, title: '' })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleEditSave()
    } else if (e.key === 'Escape') {
      handleEditCancel()
    }
  }

  const handleNewChat = () => {
    setCurrentChat(null)
  }

  return (
    <TooltipProvider>
      <div className={cn(
        "h-[100vh] max-h-[100vh] transition-all duration-200",
        isCollapsed 
          ? "w-[80px]"
          : "w-[280px]",
        "bg-[#0f0f0f]"
      )}>
        {isCollapsed ? (
          // Collapsed view - just icons
          <div className="p-2 flex items-center justify-between">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="h-9 w-9 hover:bg-white/5"
                >
                  <PanelRight className="h-5 w-5 text-gray-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Toggle sidebar
              </TooltipContent>
            </Tooltip>

            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleNewChat}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hover:bg-white/5"
                  >
                    <PenSquare className="h-5 w-5 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">New chat</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <SettingsButton 
                    open={settingsOpen}
                    onOpenChange={setSettingsOpen}
                  />
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
            </div>
          </div>
        ) : (
          // Expanded view
          <>
            <div className="p-2 flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="h-9 w-9 hover:bg-white/5"
                  >
                    <PanelRight className="h-5 w-5 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Toggle sidebar
                </TooltipContent>
              </Tooltip>

              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleNewChat}
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 hover:bg-white/5"
                    >
                      <PenSquare className="h-5 w-5 text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">New chat</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <SettingsButton 
                      open={settingsOpen}
                      onOpenChange={setSettingsOpen}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="right">Settings</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    "group flex items-center px-3 py-2 mx-2 hover:bg-white/5 rounded-lg transition-colors",
                    chat.id === currentChat && "bg-white/5"
                  )}
                >
                  {editing.id === chat.id ? (
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <input
                        type="text"
                        value={editing.title}
                        onChange={(e) => setEditing(prev => ({ ...prev, title: e.target.value }))}
                        onKeyDown={handleKeyDown}
                        className="flex-1 min-w-0 bg-transparent text-sm text-gray-200 border-none focus:outline-none focus:ring-1 focus:ring-white/20 rounded px-1"
                        autoFocus
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={handleEditSave}
                          className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setCurrentChat(chat.id)}
                        className="flex-1 text-sm text-left truncate text-gray-300"
                      >
                        {chat.title || chat.messages[0]?.content.substring(0, 30) || 'New Chat'}
                      </button>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditStart(chat)}
                          className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteChat(chat.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  )
} 