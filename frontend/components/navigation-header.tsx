"use client"

import { Search, Wallet } from "lucide-react"
import { useState } from "react"

interface NavigationHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  activeTab: string
  onTabChange: (tab: string) => void
  currentBalance: number
  onAddMoneyClick: () => void
}

export function NavigationHeader({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  currentBalance,
  onAddMoneyClick,
}: NavigationHeaderProps) {
  const [showBalance, setShowBalance] = useState(false)

  return (
    <div className="border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              <span className="text-xl font-bold">Stock</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="What are you looking for today?"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-[300px] pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-green-500"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button className="p-2 text-gray-600 hover:text-gray-900" onClick={() => setShowBalance(!showBalance)}>
                  <Wallet className="w-5 h-5" />
                </button>
                {showBalance && (
                  <div className="absolute right-0 mt-2 p-2 bg-white border border-gray-200 rounded-md shadow-lg">
                    <p className="text-sm font-medium">Balance: ${currentBalance.toFixed(2)}</p>
                  </div>
                )}
              </div>
              <button className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                V
              </button>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-8 px-6 h-12">
          <button
            className={`text-gray-600 hover:text-gray-900 h-full flex items-center ${
              activeTab === "stocks" ? "text-green-600 border-b-2 border-green-600 font-medium" : ""
            }`}
            onClick={() => onTabChange("stocks")}
          >
            Stocks
          </button>
          <button
            className={`text-gray-600 hover:text-gray-900 h-full flex items-center ${
              activeTab === "f-and-o" ? "text-green-600 border-b-2 border-green-600 font-medium" : ""
            }`}
            onClick={() => onTabChange("f-and-o")}
          >
            F&O
          </button>
          <button
            className={`text-gray-600 hover:text-gray-900 h-full flex items-center ${
              activeTab === "mutual-funds" ? "text-green-600 border-b-2 border-green-600 font-medium" : ""
            }`}
            onClick={() => onTabChange("mutual-funds")}
          >
            Mutual Funds
          </button>
        </nav>
      </div>
    </div>
  )
}

