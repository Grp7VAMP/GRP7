'use client'

import { useState } from 'react'

interface Stock {
  ticker: string
  name: string
  quantity: number
  buyPrice: number
  liveData: number | null
}

interface BuyStockFormProps {
  stock: Stock
  onClose: () => void
  onBuy: (ticker: string, quantity: number) => void
}

export function BuyStockForm({ stock, onClose, onBuy }: BuyStockFormProps) {
  const [quantity, setQuantity] = useState(1)

  const handleBuy = () => {
    onBuy(stock.ticker, quantity)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-zinc-900 p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Buy {stock.name}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400">Ticker</label>
            <input
              type="text"
              value={stock.ticker}
              disabled
              className="w-full p-2 bg-zinc-800 rounded-md text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={1}
              className="w-full p-2 bg-zinc-800 rounded-md text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400">Current Price</label>
            <input
              type="number"
              value={stock.liveData !== null ? stock.liveData : ''}
              disabled
              className="w-full p-2 bg-zinc-800 rounded-md text-white"
            />
          </div>
          <div className="flex justify-between">
            <button
              className="px-4 py-2 bg-red-600 rounded-md"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-green-600 rounded-md"
              onClick={handleBuy}
            >
              Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

