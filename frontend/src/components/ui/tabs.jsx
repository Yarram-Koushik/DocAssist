import React, { createContext, useContext, useState } from "react"
import { cn } from "../../lib/utils"

const TabsContext = createContext({})

export function Tabs({ defaultValue, children, className }) {
  const [activeTab, setActiveTab] = useState(defaultValue)
  return <TabsContext.Provider value={{ activeTab, setActiveTab }}><div className={className}>{children}</div></TabsContext.Provider>
}

export function TabsList({ children, className }) {
  return <div className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1 text-gray-500", className)}>{children}</div>
}

export function TabsTrigger({ value, children, className }) {
  const { activeTab, setActiveTab } = useContext(TabsContext)
  const isActive = activeTab === value
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all", isActive ? "bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-50 shadow-sm" : "hover:text-gray-900 dark:hover:text-gray-100", className)}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className }) {
  const { activeTab } = useContext(TabsContext)
  if (activeTab !== value) return null
  return <div className={cn("mt-2", className)}>{children}</div>
}
