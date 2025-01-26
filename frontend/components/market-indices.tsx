"use client"

import { ChevronRight } from "lucide-react"

export function MarketIndices() {
  return (
    <div className="py-6 overflow-x-auto">
      <div className="flex gap-6 min-w-max">
        <IndexCard name="NIFTY" value="23,092.20" change="-113.15" changePercent="-0.49" />
        <IndexCard name="SENSEX" value="76,190.46" change="-329.92" changePercent="-0.43" />
        <IndexCard name="BANKNIFTY" value="48,367.80" change="-221.20" changePercent="-0.46" />
        <IndexCard name="FINNIFTY" value="22,092.20" change="-113.15" changePercent="-0.49" />
        <button className="flex items-center justify-center w-8">
          <ChevronRight className="w-6 h-6 text-gray-400" />
        </button>
      </div>
    </div>
  )
}

interface IndexCardProps {
  name: string
  value: string
  change: string
  changePercent: string
}

function IndexCard({ name, value, change, changePercent }: IndexCardProps) {
  const isNegative = change.startsWith("-")

  return (
    <div className="min-w-[200px]">
      <div className="text-sm font-medium text-gray-600 mb-1">{name}</div>
      <div className="text-lg font-semibold">{value}</div>
      <div className={`text-sm ${isNegative ? "text-red-500" : "text-green-500"}`}>
        {change} ({changePercent}%)
      </div>
    </div>
  )
}

