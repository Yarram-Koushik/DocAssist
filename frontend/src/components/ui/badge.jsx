import React from "react"
import { cn } from "../../lib/utils"

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "border-transparent bg-primary text-white hover:bg-primary-dark",
    secondary: "border-transparent bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700",
    destructive: "border-transparent bg-red-500 text-white hover:bg-red-600",
    outline: "text-gray-950 dark:text-gray-50",
  }

  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none", variants[variant], className)} {...props} />
  )
}

export { Badge }
