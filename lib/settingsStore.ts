import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  apiKey: string | null
  setApiKey: (key: string | null) => void
  hasApiKey: () => boolean
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      apiKey: null,
      setApiKey: (key) => set({ apiKey: key }),
      hasApiKey: () => Boolean(get().apiKey),
    }),
    {
      name: 'settings-storage',
    }
  )
) 