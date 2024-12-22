import { Button } from '@/components/ui/button'
import { Settings, Trash2 } from 'lucide-react'
import { useSettingsStore } from '@/lib/settingsStore'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SettingsButton({ 
  open, 
  onOpenChange 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const { apiKey, setApiKey, hasApiKey } = useSettingsStore()
  const [inputKey, setInputKey] = useState('')
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!inputKey.startsWith('sk-')) {
      setError('API key must start with "sk-"')
      return
    }
    setApiKey(inputKey)
    setInputKey('')
    setError('')
    onOpenChange(false)
  }

  const handleDelete = () => {
    setApiKey(null)
    setInputKey('')
  }

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => onOpenChange(true)}
        className="text-[#10A37F] hover:text-[#0E906F] hover:bg-[#10A37F]/10 transition-colors"
      >
        Set API Key
      </Button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#1E1E1E] border-white/10 text-gray-200">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">OpenAI API Key</Label>
              {hasApiKey() ? (
                <div className="flex items-center gap-2">
                  <Input
                    value="sk-••••••••••••••••••••••"
                    disabled
                    className="bg-[#2A2A2A] border-white/10 text-gray-400"
                  />
                  <Button
                    onClick={handleDelete}
                    variant="ghost"
                    size="icon"
                    className="hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    id="apiKey"
                    type="password"
                    value={inputKey}
                    onChange={(e) => {
                      setInputKey(e.target.value)
                      setError('')
                    }}
                    placeholder="sk-..."
                    className="bg-[#2A2A2A] border-white/10 text-gray-200 focus:ring-white/20"
                  />
                  {error && (
                    <p className="text-xs text-red-400">{error}</p>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-400">
                Your API key is stored locally and never sent to any server except OpenAI.
              </p>
            </div>
            {!hasApiKey() && (
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  className="bg-[#10A37F] hover:bg-[#0E906F] text-white"
                >
                  Save
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 