'use client'

import { useState } from 'react'

export function NavigationTabs({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const [activeTab, setActiveTab] = useState('holdings')

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    onTabChange(tab)
  }

  return (
    <div className="flex gap-4 overflow-x-auto py-2 -mx-4 px-4">
      <button
        className={`rounded-full px-4 py-2 text-sm font-medium ${
          activeTab === 'explore'
            ? 'bg-white/10 text-white'
            : 'bg-transparent border border-zinc-800 text-white'
        } whitespace-nowrap`}
        onClick={() => handleTabChange('explore')}
      >
        Explore
      </button>
      <button
        className={`rounded-full px-4 py-2 text-sm font-medium ${
          activeTab === 'holdings'
            ? 'bg-white/10 text-white'
            : 'bg-transparent border border-zinc-800 text-white'
        } whitespace-nowrap`}
        onClick={() => handleTabChange('holdings')}
      >
        Holdings
      </button>
    </div>
  )
}

