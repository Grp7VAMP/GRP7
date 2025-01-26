"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { NavigationHeader } from "@/components/navigation-header"
import { MarketIndices } from "@/components/market-indices"
import { PortfolioOverview } from "@/components/portfolio-overview"
import { StockHoldings } from "@/components/stock-holdings"
import { FAndO } from "@/components/f-and-o"
import { MutualFunds } from "@/components/mutual-funds"
import { AddMoneyForm } from "@/components/add-money-form"
import { Toast } from "@/components/toast"
import { WebSocketProvider } from "@/contexts/websocket-context"

const BASE_URL = "https://sheltered-ridge-48373-ad732e1c98b9.herokuapp.com"

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000,
})

interface Stock {
  ticker: string
  name: string
  quantity: number
  buyPrice: number
  livePrice: number | null
}

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("")
  const [holdings, setHoldings] = useState<Stock[]>([])
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("stocks")
  const [currentBalance, setCurrentBalance] = useState(10000) // Starting with $10,000 virtual money
  const [showAddMoneyForm, setShowAddMoneyForm] = useState(false)

  useEffect(() => {
    fetchHoldings()
  }, [])

  const fetchHoldings = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<Stock[]>("/stocks")
      setHoldings(response.data)
    } catch (error) {
      console.error("Error fetching holdings:", error)
      setToast({
        message: axios.isAxiosError(error) ? error.message : "Failed to fetch holdings",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuyStock = async (ticker: string, quantityToBuy: number, retryCount = 0) => {
    if (quantityToBuy <= 0) {
      setToast({ message: "Quantity must be greater than 0", type: "error" })
      return
    }

    const maxRetries = 3
    const baseDelay = 1000

    try {
      console.log(`Attempting to buy ${quantityToBuy} shares of ${ticker}. Attempt ${retryCount + 1}`)

      const quantity = Math.max(1, Math.floor(quantityToBuy))

      const response = await api.post("/stocks/buy", {
        ticker: ticker.trim(),
        quantityToBuy: quantity,
      })
      console.log("Buy response:", response.data)
      setToast({ message: response.data.message || "Stock bought successfully", type: "success" })
      await fetchHoldings()
    } catch (error) {
      console.error("Error buying stock:", error)
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 500 && retryCount < maxRetries) {
          const delayTime = baseDelay * Math.pow(2, retryCount)
          console.log(`Retrying buy operation for ${ticker}. Attempt ${retryCount + 1} in ${delayTime}ms`)
          await new Promise((resolve) => setTimeout(resolve, delayTime))
          return handleBuyStock(ticker, quantityToBuy, retryCount + 1)
        }

        setToast({
          message: error.response?.data?.message || `Failed to buy stock: ${error.message}`,
          type: "error",
        })
      } else {
        setToast({
          message: "An unexpected error occurred while buying the stock",
          type: "error",
        })
      }
    }
  }

  const handleSellStock = async (ticker: string, quantityToSell: number) => {
    if (quantityToSell <= 0) {
      setToast({ message: "Quantity must be greater than 0", type: "error" })
      return
    }

    try {
      const quantity = Math.max(1, Math.floor(quantityToSell))

      const response = await api.post("/stocks/sell", {
        ticker: ticker.trim(),
        quantityToSell: quantity,
      })
      setToast({ message: response.data.message || "Stock sold successfully", type: "success" })
      await fetchHoldings()
    } catch (error) {
      console.error("Error selling stock:", error)
      if (axios.isAxiosError(error) && error.response) {
        setToast({
          message: error.response.data.message || "Failed to sell stock. Please try again.",
          type: "error",
        })
      } else {
        setToast({
          message: "An unexpected error occurred while selling the stock",
          type: "error",
        })
      }
    }
  }

  const handleAddMoney = (amount: number) => {
    setCurrentBalance((prevBalance) => prevBalance + amount)
    setToast({ message: `Successfully added $${amount.toFixed(2)}`, type: "success" })
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <WebSocketProvider>
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          currentBalance={currentBalance}
          onAddMoneyClick={() => setShowAddMoneyForm(true)}
        />
        <main className="max-w-[1400px] mx-auto px-6">
          <MarketIndices />
          <div className="grid lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2">
              {activeTab === "stocks" && (
                <>
                  <PortfolioOverview holdings={holdings} />
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  ) : (
                    <StockHoldings holdings={holdings} onBuy={handleBuyStock} onSell={handleSellStock} />
                  )}
                </>
              )}
              {activeTab === "f-and-o" && <FAndO />}
              {activeTab === "mutual-funds" && <MutualFunds />}
            </div>
            <div className="hidden lg:block">
              <div className="bg-white rounded-lg p-6 text-center border border-gray-200">
                <h3 className="text-lg font-medium mb-4">Add money to invest</h3>
                <button
                  className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors"
                  onClick={() => setShowAddMoneyForm(true)}
                >
                  Add money
                </button>
              </div>
            </div>
          </div>
        </main>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        {showAddMoneyForm && <AddMoneyForm onAddMoney={handleAddMoney} onClose={() => setShowAddMoneyForm(false)} />}
      </div>
    </WebSocketProvider>
  )
}

