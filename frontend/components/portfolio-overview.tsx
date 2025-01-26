"use client"

import { useWebSocket } from "@/contexts/websocket-context"
import { useMemo } from "react"

interface Stock {
  ticker: string
  name: string
  quantity: number
  buyPrice: number
  livePrice: number | null
}

interface PortfolioOverviewProps {
  holdings: Stock[]
}

export function PortfolioOverview({ holdings }: PortfolioOverviewProps) {
  const { prices } = useWebSocket()

  const { totalCurrent, totalInvested, totalReturns, returnsPercentage } = useMemo(() => {
    const totalCurrent = holdings.reduce((sum, holding) => {
      const currentPrice = prices[holding.ticker] || holding.livePrice || 0
      return sum + currentPrice * holding.quantity
    }, 0)

    const totalInvested = holdings.reduce((sum, holding) => sum + holding.buyPrice * holding.quantity, 0)

    const totalReturns = totalCurrent - totalInvested
    const returnsPercentage = totalInvested !== 0 ? (totalReturns / totalInvested) * 100 : 0

    return { totalCurrent, totalInvested, totalReturns, returnsPercentage }
  }, [holdings, prices])

  const formatPrice = (price: number) => {
    return `₹${Math.abs(price).toFixed(2)}`
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Holdings ({holdings.length})</h2>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="text-sm text-gray-600 mb-1">Current value</div>
            <div className="text-3xl font-bold">{formatPrice(totalCurrent)}</div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <div>
                <div className="text-sm text-gray-600">Invested value</div>
                <div className="font-medium">{formatPrice(totalInvested)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Total returns</div>
                <div className={`font-medium ${totalReturns >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {totalReturns >= 0 ? "+" : "-"}
                  {formatPrice(totalReturns)} ({Math.abs(returnsPercentage).toFixed(2)}%)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

