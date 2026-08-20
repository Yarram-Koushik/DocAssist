import React from "react"
import { cn } from "../../lib/utils"

export function Avatar({ className, initials, src }) {
  return (
    <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800", className)}>
      {src ? (
        <img className="aspect-square h-full w-full object-cover" src={src} alt="avatar" />
      ) : (
        <span className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
          {initials}
        </span>
      )}
    </div>
  )
}
