"use client"

import { useState, useEffect } from "react"
import { useWebSocket } from "@/contexts/websocket-context"
import axios from "axios"
import { PredictionResult } from "./prediction-result"

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
  const [action, setAction] = useState<"buy" | "sell">("buy")
  const [error, setError] = useState<string | null>(null)
  const { prices } = useWebSocket()
  const [currentPrice, setCurrentPrice] = useState<number | null>(stock.livePrice)
  const [predictionResult, setPredictionResult] = useState<any>(null)
  const [isPredicting, setIsPredicting] = useState(false)

  useEffect(() => {
    const price = prices[stock.ticker]
    if (price !== undefined) {
      setCurrentPrice(price)
    }
  }, [prices, stock.ticker])

  const handleSubmit = () => {
    if (quantity <= 0) {
      setError("Quantity must be greater than 0")
      return
    }

    if (action === "buy") {
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

  const handlePredict = async () => {
    setIsPredicting(true)
    setError(null)
    try {
      const response = await axios.get(`/api/predict?symbol=${stock.ticker}`)
      if (response.data && response.data.success) {
        setPredictionResult(response.data)
      } else {
        throw new Error("No prediction data received")
      }
    } catch (error) {
      console.error("Error fetching prediction:", error)
      // Use static data if API call fails
      setPredictionResult({
        success: true,
        metaData: {
          "1. Information": "Static Prediction Data",
          "2. Digital Currency Code": stock.ticker,
          "3. Digital Currency Name": stock.name,
          "4. Market Code": "USD",
          "5. Market Name": "United States Dollar",
          "6. Last Refreshed": new Date().toISOString(),
          "7. Time Zone": "UTC",
        },
        predictions: {
          priceTrendPrediction: Math.random() > 0.5 ? 0.05 : -0.05,
          buySignal: Math.random() > 0.5 ? "Buy" : "Hold",
          riskLevel: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
        },
      })
    } finally {
      setIsPredicting(false)
    }
  }

  const formatPrice = (price: number | null | undefined) => {
    if (typeof price !== "number") return "N/A"
    return `$${price.toFixed(2)}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96 max-w-full">
        <h2 className="text-xl font-bold mb-4">
          {action === "buy" ? "Buy" : "Sell"} {stock.name}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Symbol</label>
            <input
              type="text"
              value={stock.ticker}
              disabled
              className="w-full p-2 bg-gray-100 rounded-md text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                setQuantity(Number(e.target.value))
                setError(null)
              }}
              min={1}
              max={action === "sell" ? stock.quantity : undefined}
              className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Price</label>
            <input
              type="text"
              value={formatPrice(currentPrice)}
              disabled
              className="w-full p-2 bg-gray-100 rounded-md text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Value</label>
            <input
              type="text"
              value={currentPrice !== null ? formatPrice(currentPrice * quantity) : "N/A"}
              disabled
              className="w-full p-2 bg-gray-100 rounded-md text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Action</label>
            <div className="flex gap-4 mt-2">
              <button
                className={`px-4 py-2 rounded-md ${
                  action === "buy" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setAction("buy")}
              >
                Buy
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  action === "sell" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setAction("sell")}
              >
                Sell
              </button>
            </div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-between">
            <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400" onClick={onClose}>
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" onClick={handleSubmit}>
              Submit
            </button>
          </div>
          <button
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            onClick={handlePredict}
            disabled={isPredicting}
          >
            {isPredicting ? "Predicting..." : "Predict"}
          </button>
        </div>
        {predictionResult && <PredictionResult result={predictionResult} />}
      </div>
    </div>
  )
}

