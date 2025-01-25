'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { NavigationTabs } from "@/components/navigation-tabs"
import { PortfolioSummary } from "@/components/portfolio-summary"
import { HoldingsList } from "@/components/holdings-list"
import { ExploreStocks } from "@/components/explore-stocks"
import { StockLogoIcon } from "@/components/icons"
import { Toast } from "@/components/toast"
import { WebSocketProvider } from "@/contexts/websocket-context"
import { Tooltip } from "@/components/tooltip"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface Stock {
  ticker: string
  name: string
  quantity: number
  buyPrice: number
  livePrice: number | null
}

const BASE_URL = 'https://sheltered-ridge-48373-ad732e1c98b9.herokuapp.com'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

export default function Page() {
  const [activeTab, setActiveTab] = useState('holdings')
  const [holdings, setHoldings] = useState<Stock[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchHoldings()
  }, [])

  const fetchHoldings = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<Stock[]>('/stocks')
      setHoldings(response.data)
    } catch (error) {
      console.error('Error fetching holdings:', error)
      setToast({ 
        message: axios.isAxiosError(error) ? error.message : 'Failed to fetch holdings', 
        type: 'error' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuyStock = async (ticker: string, quantityToBuy: number, retryCount = 0) => {
    if (quantityToBuy <= 0) {
      setToast({ message: 'Quantity must be greater than 0', type: 'error' })
      return
    }

    const maxRetries = 3
    const baseDelay = 1000 // 1 second

    try {
      console.log(`Attempting to buy ${quantityToBuy} shares of ${ticker}. Attempt ${retryCount + 1}`)
      
      // Ensure quantityToBuy is a positive integer
      const quantity = Math.max(1, Math.floor(quantityToBuy))
      
      // Note: Live price check removed as the endpoint is not available.
      // The server should handle live price availability internally.
      // Remove this block
      // const livePrice = await api.get(`/stocks/${ticker}/price`)
      // if (!livePrice.data || livePrice.data.price === null) {
      //   setToast({ 
      //     message: 'Live price for this stock is currently unavailable. Please try again later.',
      //     type: 'error' 
      //   })
      //   return
      // }

      const response = await api.post('/stocks/buy', { 
        ticker: ticker.trim(),
        quantityToBuy: quantity
      })
      console.log('Buy response:', response.data)
      setToast({ message: response.data.message || 'Stock bought successfully', type: 'success' })
      await fetchHoldings()
    } catch (error) {
      console.error('Error buying stock:', error)
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
        })

        if (error.response?.status === 500 && retryCount < maxRetries) {
          const delayTime = baseDelay * Math.pow(2, retryCount)
          console.log(`Retrying buy operation for ${ticker}. Attempt ${retryCount + 1} in ${delayTime}ms`)
          await delay(delayTime)
          return handleBuyStock(ticker, quantityToBuy, retryCount + 1)
        }

        if (error.response?.status === 400) {
          setToast({ 
            message: 'Unable to process the request. The stock might be unavailable or there might be an issue with the live price.',
            type: 'error' 
          })
        } else if (error.response?.data?.error?.name === 'PrismaClientValidationError') {
          setToast({ 
            message: 'Invalid data format. Please check your input and try again.',
            type: 'error' 
          })
        } else {
          setToast({ 
            message: error.response?.data?.message || `Failed to buy stock: ${error.message}`, 
            type: 'error' 
          })
        }
      } else {
        setToast({ 
          message: 'An unexpected error occurred while buying the stock', 
          type: 'error' 
        })
      }
    }
  }

  const handleSellStock = async (ticker: string, quantityToSell: number) => {
    if (quantityToSell <= 0) {
      setToast({ message: 'Quantity must be greater than 0', type: 'error' })
      return
    }

    try {
      // Ensure quantityToSell is a positive integer
      const quantity = Math.max(1, Math.floor(quantityToSell))

      const response = await api.post('/stocks/sell', {
        ticker: ticker.trim(), // Ensure no whitespace
        quantityToSell: quantity
      })
      setToast({ message: response.data.message || 'Stock sold successfully', type: 'success' })
      await fetchHoldings()
    } catch (error) {
      console.error('Error selling stock:', error)
      if (axios.isAxiosError(error) && error.response) {
        if (error.response?.data?.error?.name === 'PrismaClientValidationError') {
          setToast({ 
            message: 'Invalid data format. Please check your input and try again.',
            type: 'error' 
          })
        } else {
          setToast({ 
            message: error.response.data.message || 'Failed to sell stock. Please try again.', 
            type: 'error' 
          })
        }
      } else {
        setToast({ 
          message: 'An unexpected error occurred while selling the stock', 
          type: 'error' 
        })
      }
    }
  }

  return (
    <WebSocketProvider wsUrl={'wss://sheltered-ridge-48373-ad732e1c98b9.herokuapp.com'}>
      <div className="min-h-screen bg-black text-white">
        <header className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <StockLogoIcon className="h-8 w-8 text-blue-500" />
            <h1 className="text-2xl font-bold">Stocks</h1>
          </div>
          <div className="flex items-center">
            <Tooltip content="Vivek Singh">
              <div className="h-8 w-8 rounded-full bg-green-700 flex items-center justify-center cursor-pointer">
                V
              </div>
            </Tooltip>
          </div>
        </header>
        <main className="p-4 space-y-6">
          <NavigationTabs onTabChange={setActiveTab} />
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <>
              {activeTab === 'holdings' && (
                <>
                  <PortfolioSummary holdings={holdings} />
                  <HoldingsList holdings={holdings} onBuy={handleBuyStock} onSell={handleSellStock} />
                </>
              )}
              {activeTab === 'explore' && (
                <ExploreStocks onBuyStock={handleBuyStock} />
              )}
            </>
          )}
        </main>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </div>
    </WebSocketProvider>
  )
}

