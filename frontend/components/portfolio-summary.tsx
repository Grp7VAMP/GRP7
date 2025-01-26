import { useWebSocket } from "@/contexts/websocket-context"
import { useMemo } from "react"

interface Stock {
  ticker: string
  name: string
  quantity: number
  buyPrice: number
  livePrice: number | null
}

export function PortfolioSummary({ holdings }: { holdings: Stock[] }) {
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

  const formatPrice = (price: number | null | undefined) => {
    if (typeof price !== "number") return "N/A"
    return `$${Math.abs(price).toFixed(2)}`
  }

  const formatPercentage = (percentage: number | null | undefined) => {
    if (typeof percentage !== "number") return "N/A"
    return `${Math.abs(percentage).toFixed(2)}%`
  }

  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold">Holdings ({holdings.length})</h2>
      <div className="rounded-lg bg-zinc-900 p-4 space-y-4">
        <div className="flex justify-between">
          <div>
            <div className="text-sm text-zinc-400">Current</div>
            <div className="text-2xl font-bold">{formatPrice(totalCurrent)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-zinc-400">Total returns</div>
            <div className={`text-lg font-semibold ${totalReturns >= 0 ? "text-green-500" : "text-red-500"}`}>
              {totalReturns >= 0 ? "+" : "-"}
              {formatPrice(totalReturns)} ({formatPercentage(returnsPercentage)})
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <div>
            <div className="text-sm text-zinc-400">Invested</div>
            <div className="text-2xl font-bold">{formatPrice(totalInvested)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

