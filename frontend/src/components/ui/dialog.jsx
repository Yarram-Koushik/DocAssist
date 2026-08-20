import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { cn } from "../../lib/utils"
import { X } from "lucide-react"

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative z-50 w-full max-w-lg rounded-lg bg-card-light dark:bg-card-dark p-6 shadow-lg sm:rounded-xl">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>,
    document.body
  )
}
