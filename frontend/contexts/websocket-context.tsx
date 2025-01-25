'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface StockData {
  ticker: string
  livePrice: number
  buyPrice: number
}

interface WebSocketContextType {
  prices: { [key: string]: number }
}

const WebSocketContext = createContext<WebSocketContextType>({ prices: {} })

const WS_URL = 'wss://sheltered-ridge-48373-ad732e1c98b9.herokuapp.com'

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    let reconnectCount = 0;
    let ws: WebSocket | null = null

    const connect = () => {
      ws = new WebSocket(WS_URL)

      ws.onopen = () => {
        console.log('Connected to WebSocket')
        reconnectCount = 0;
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setPrices(prevPrices => ({
            ...prevPrices,
            ...data.reduce((acc: { [key: string]: number }, item: StockData) => {
              acc[item.ticker] = item.livePrice
              return acc
            }, {})
          }))
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.reason)
        const backoffDelay = Math.min(1000 * (2 ** reconnectCount), 30000); // Max delay of 30 seconds
        console.log(`Attempting to reconnect in ${backoffDelay}ms...`)
        setTimeout(() => {
          reconnectCount++;
          connect();
        }, backoffDelay);
      }
    }

    connect()

    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{ prices }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocket = () => useContext(WebSocketContext)

