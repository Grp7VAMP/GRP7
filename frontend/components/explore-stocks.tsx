"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { BuyStockForm } from "./buy-stock-form"
import { useWebSocket } from "@/contexts/websocket-context"

interface Stock {
  ticker: string
  name: string
  quantity: number
  buyPrice: number
  livePrice: number | null
}

interface ExploreStocksProps {
  onBuyStock: (ticker: string, quantity: number) => void
}

const BASE_URL = "https://sheltered-ridge-48373-ad732e1c98b9.herokuapp.com"

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

export function ExploreStocks({ onBuyStock }: ExploreStocksProps) {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { prices } = useWebSocket()

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await api.get<Stock[]>("/stocks")
        setStocks(response.data)
      } catch (error) {
        console.error("Error fetching stocks:", error)
        setError(axios.isAxiosError(error) ? error.message : "Failed to fetch stocks")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStocks()
  }, [])

  const formatPrice = (price: number | null | undefined) => {
    if (typeof price !== "number") return "Loading..."
    return `$${price.toFixed(2)}`
  }

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search stocks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 bg-zinc-800 rounded-md text-white"
      />
      <div className="space-y-2">
        {filteredStocks.map((stock) => {
          const currentPrice = prices[stock.ticker] || stock.livePrice
          return (
            <div
              key={stock.ticker}
              className="flex justify-between items-center p-2 bg-zinc-900 rounded-md cursor-pointer"
              onClick={() => setSelectedStock({ ...stock, livePrice: currentPrice })}
            >
              <div>
                <div className="font-medium">{stock.name}</div>
                <div className="text-sm text-zinc-400">{stock.ticker}</div>
              </div>
              <div className="font-medium">{formatPrice(currentPrice)}</div>
            </div>
          )
        })}
      </div>
      {selectedStock && (
        <BuyStockForm stock={selectedStock} onClose={() => setSelectedStock(null)} onBuy={onBuyStock} />
      )}
    </div>
  )
}

