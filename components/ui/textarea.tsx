import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex w-full resize-none bg-white dark:bg-[#40414F] border border-black/10 dark:border-gray-800/50 rounded-xl px-4 py-3 text-base placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
