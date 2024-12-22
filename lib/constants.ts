export const AVAILABLE_MODELS = [
  {
    id: "gpt-o1",
    name: "o1-preview",
    alias: "o1-preview",
    description: "Fast and reliable"
  },
  {
    id: "gpt-o1-mini",
    name: "o1 mini",
    alias: "o1-mini",
    description: "Fastest response times"
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    alias: "chatgpt-4o-latest",
    description: "Most capable"
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    alias: "gpt-4o-mini",
    description: "Balanced performance"
  }
] as const

export type ModelId = typeof AVAILABLE_MODELS[number]['id'] 