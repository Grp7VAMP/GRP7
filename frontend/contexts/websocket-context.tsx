"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface StockData {
  ticker: string
  livePrice: number
  buyPrice: number
}

interface WebSocketContextType {
  prices: { [key: string]: number }
  connectionStatus: "connecting" | "connected" | "disconnected"
}

const WebSocketContext = createContext<WebSocketContextType>({
  prices: {},
  connectionStatus: "disconnected",
})

const WS_URL = "wss://sheltered-ridge-48373-ad732e1c98b9.herokuapp.com"

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<{ [key: string]: number }>({})
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected")

  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null
    let reconnectAttempts = 0
    const maxReconnectAttempts = 5
    const reconnectInterval = 5000

    const connect = () => {
      if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
        return
      }

      setConnectionStatus("connecting")
      ws = new WebSocket(WS_URL)

      ws.onopen = () => {
        console.log("WebSocket connected")
        setConnectionStatus("connected")
        reconnectAttempts = 0
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setPrices((prevPrices) => ({
            ...prevPrices,
            ...data.reduce((acc: { [key: string]: number }, item: StockData) => {
              acc[item.ticker] = item.livePrice
              return acc
            }, {}),
          }))
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        setConnectionStatus("disconnected")
      }

      ws.onclose = (event) => {
        console.log("WebSocket connection closed:", event.reason)
        setConnectionStatus("disconnected")

        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
          console.log(`Attempting to reconnect in ${delay}ms...`)
          reconnectTimeout = setTimeout(() => {
            reconnectAttempts++
            connect()
          }, delay)
        } else {
          console.error("Max reconnection attempts reached")
        }
      }
    }

    connect()

    return () => {
      if (ws) {
        ws.close()
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
    }
  }, [])

  return <WebSocketContext.Provider value={{ prices, connectionStatus }}>{children}</WebSocketContext.Provider>
}

export const useWebSocket = () => useContext(WebSocketContext)

