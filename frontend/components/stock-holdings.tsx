"use client"

import { useState } from "react"
import { ChevronDown, ArrowUpDown } from "lucide-react"
import { LineChart, Line } from "recharts"
import { BuySellForm } from "./buy-sell-form"
import { useWebSocket } from "@/contexts/websocket-context"

interface Stock {
  ticker: string
  name: string
  quantity: number
  buyPrice: number
  livePrice: number | null
}

interface StockHoldingsProps {
  holdings: Stock[]
  onBuy: (ticker: string, quantity: number) => void
  onSell: (ticker: string, quantity: number) => void
}

export function StockHoldings({ holdings, onBuy, onSell }: StockHoldingsProps) {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const { prices } = useWebSocket()

  const formatPrice = (price: number | null | undefined) => {
    if (typeof price !== "number") return "N/A"
    return `₹${price.toFixed(2)}`
  }

  const calculateChange = (currentPrice: number | null, buyPrice: number) => {
    if (currentPrice === null) return { change: 0, changePercent: 0 }
    const change = currentPrice - buyPrice
    const changePercent = (change / buyPrice) * 100
    return { change, changePercent }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left p-4">
              <button className="flex items-center gap-2 text-sm font-medium text-gray-600">
                Company
                <ChevronDown className="w-4 h-4" />
              </button>
            </th>
            <th className="text-right p-4">
              <button className="flex items-center gap-2 text-sm font-medium text-gray-600 ml-auto">
                Mkt price
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </th>
            <th className="text-right p-4">
              <span className="text-sm font-medium text-gray-600">Returns (%)</span>
            </th>
            <th className="text-right p-4">
              <span className="text-sm font-medium text-gray-600">Current</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {holdings
            .filter((h) => h.quantity > 0)
            .map((holding) => {
              const currentPrice = prices[holding.ticker] || holding.livePrice
              const { change, changePercent } = calculateChange(currentPrice, holding.buyPrice)
              const currentValue = (currentPrice || 0) * holding.quantity
              const investedValue = holding.buyPrice * holding.quantity

              // Create chart data from buy price and current price
              const chartData = [{ value: holding.buyPrice }, { value: currentPrice || holding.buyPrice }]

              return (
                <tr
                  key={holding.ticker}
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedStock(holding)}
                >
                  <td className="p-4">
                    <div className="font-medium">{holding.name}</div>
                    <div className="text-sm text-gray-600">
                      {holding.quantity} shares • Avg. {formatPrice(holding.buyPrice)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-4">
                      <div className="w-24 h-12">
                        <LineChart width={96} height={48} data={chartData}>
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={change >= 0 ? "#22c55e" : "#ef4444"}
                            strokeWidth={1.5}
                            dot={false}
                          />
                        </LineChart>
                      </div>
                      <div className="text-right">
                        <div>{formatPrice(currentPrice)}</div>
                        <div className={`text-sm ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {change >= 0 ? "+" : ""}
                          {formatPrice(Math.abs(change))} ({changePercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className={changePercent >= 0 ? "text-green-500" : "text-red-500"}>
                      {changePercent >= 0 ? "+" : ""}
                      {changePercent.toFixed(2)}%
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-right">{formatPrice(currentValue)}</div>
                    <div className="text-sm text-gray-600 text-right">{formatPrice(investedValue)}</div>
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>

      {selectedStock && (
        <BuySellForm stock={selectedStock} onClose={() => setSelectedStock(null)} onBuy={onBuy} onSell={onSell} />
      )}
    </div>
  )
}

