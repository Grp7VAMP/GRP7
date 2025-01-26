"use client"

import { useState } from "react"
import { LineChart, Line } from "recharts"
import { SortIcon } from "./icons"
import { BuySellForm } from "./buy-sell-form"
import { useWebSocket } from "@/contexts/websocket-context"

interface Stock {
  ticker: string
  name: string
  quantity: number
  buyPrice: number
  livePrice: number | null
}

interface HoldingsListProps {
  holdings: Stock[]
  onBuy: (ticker: string, quantity: number) => void
  onSell: (ticker: string, quantity: number) => void
}

export function HoldingsList({ holdings, onBuy, onSell }: HoldingsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const { prices } = useWebSocket()

  const filteredHoldings = holdings.filter(
    (holding) =>
      (holding.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        holding.ticker.toLowerCase().includes(searchTerm.toLowerCase())) &&
      holding.quantity > 0,
  )

  const formatPrice = (price: number | null | undefined) => {
    if (typeof price !== "number") return "N/A"
    return `$${price.toFixed(2)}`
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search holdings..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 bg-zinc-800 rounded-md text-white"
      />
      <div className="flex items-center justify-between">
        <button className="flex items-center gap-2">
          <span>Sort</span>
          <SortIcon className="h-4 w-4" />
        </button>
        <span>Current (Invested)</span>
      </div>
      <div className="space-y-4">
        {filteredHoldings.map((holding) => {
          const currentPrice = prices[holding.ticker] || holding.livePrice
          const priceChange = currentPrice !== null ? currentPrice - holding.buyPrice : null
          const isPositive = priceChange !== null ? priceChange >= 0 : false

          return (
            <div
              key={holding.ticker}
              className="flex items-center justify-between p-2 bg-zinc-900 rounded-md cursor-pointer"
              onClick={() => setSelectedStock({ ...holding, livePrice: currentPrice })}
            >
              <div>
                <div className="font-medium">{holding.name}</div>
                <div className="text-sm text-zinc-400">{holding.quantity} shares</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 h-12">
                  {currentPrice !== null && (
                    <LineChart width={96} height={48} data={[{ value: holding.buyPrice }, { value: currentPrice }]}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={isPositive ? "#22c55e" : "#ef4444"}
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatPrice(currentPrice)}</div>
                  <div className="text-sm text-zinc-400">({formatPrice(holding.buyPrice)})</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {selectedStock && (
        <BuySellForm stock={selectedStock} onClose={() => setSelectedStock(null)} onBuy={onBuy} onSell={onSell} />
      )}
    </div>
  )
}

