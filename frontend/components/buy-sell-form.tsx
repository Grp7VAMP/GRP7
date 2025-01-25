'use client'

import { useState, useEffect } from 'react'
import { useWebSocket } from '@/contexts/websocket-context'

interface Stock {
  ticker: string
  name: string
  quantity: number
  buyPrice: number
  livePrice: number | null
}

interface BuySellFormProps {
  stock: Stock
  onClose: () => void
  onBuy: (ticker: string, quantityToBuy: number) => void
  onSell: (ticker: string, quantity: number) => void
}

export function BuySellForm({ stock, onClose, onBuy, onSell }: BuySellFormProps) {
  const [quantity, setQuantity] = useState(1)
  const [action, setAction] = useState<'buy' | 'sell'>('buy')
  const [error, setError] = useState<string | null>(null)
  const { prices } = useWebSocket()
  const [currentPrice, setCurrentPrice] = useState<number | null>(stock.livePrice)

  useEffect(() => {
    const price = prices[stock.ticker]
    if (price !== undefined) {
      setCurrentPrice(price)
    }
  }, [prices, stock.ticker])

  const handleSubmit = () => {
    if (quantity <= 0) {
      setError('Quantity must be greater than 0')
      return
    }

    if (action === 'buy') {
      onBuy(stock.ticker, quantity)
    } else {
      if (quantity > stock.quantity) {
        setError(`You can't sell more than you own (${stock.quantity})`)
        return
      }
      onSell(stock.ticker, quantity)
    }
    onClose()
  }

  const formatPrice = (price: number | null) => {
    if (price === null || isNaN(price)) {
      return 'N/A'
    }
    return `$${price.toFixed(2)}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-zinc-900 p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">{action === 'buy' ? 'Buy' : 'Sell'} {stock.name}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400">Symbol</label>
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
              onChange={(e) => {
                setQuantity(Number(e.target.value))
                setError(null)
              }}
              min={1}
              max={action === 'sell' ? stock.quantity : undefined}
              className="w-full p-2 bg-zinc-800 rounded-md text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400">Current Price</label>
            <input
              type="text"
              value={formatPrice(currentPrice)}
              disabled
              className="w-full p-2 bg-zinc-800 rounded-md text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400">Total Value</label>
            <input
              type="text"
              value={currentPrice !== null ? formatPrice(currentPrice * quantity) : 'N/A'}
              disabled
              className="w-full p-2 bg-zinc-800 rounded-md text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400">Action</label>
            <div className="flex gap-4 mt-2">
              <button
                className={`px-4 py-2 rounded-md ${
                  action === 'buy' ? 'bg-green-600' : 'bg-zinc-700'
                }`}
                onClick={() => setAction('buy')}
              >
                Buy
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  action === 'sell' ? 'bg-red-600' : 'bg-zinc-700'
                }`}
                onClick={() => setAction('sell')}
              >
                Sell
              </button>
            </div>
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <div className="flex justify-between">
            <button
              className="px-4 py-2 bg-zinc-600 rounded-md"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 rounded-md"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

