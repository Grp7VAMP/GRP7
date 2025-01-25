import express from 'express';
import { PrismaClient } from '@prisma/client';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import WebSocket from 'ws';
import axios  from "axios"
import tf from "@tensorflow/tfjs";

dotenv.config();

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize WebSocket server for frontend connections
const wss = new WebSocketServer({ server });

// Initialize Prisma client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Finnhub WebSocket configuration
const FINNHUB_WS_URL = process.env.URL;
const API_KEY = process.env.API_KEY;
const Alpha_Key = process.env.Alpha_Key;
let finnhubSocket = null;

// Data storage
const clients = new Set();
const liveStockData = new Map();
const subscribedStocks = new Set();

// Middleware
app.use(express.json());
app.use(cors());

// Initialize Finnhub WebSocket connection
function initializeFinnhubSocket() {
  finnhubSocket = new WebSocket(`${FINNHUB_WS_URL}?token=${API_KEY}`);

  finnhubSocket.on('open', () => {
    console.log('Connected to Finnhub WebSocket');
    // Resubscribe to all stocks
    subscribedStocks.forEach((symbol) => {
      if (finnhubSocket) {
        finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol }));
      }
    });
  });

  finnhubSocket.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      if (message.type === 'trade' && message.data) {
        message.data.forEach((trade) => {
          const { s: symbol, p: price } = trade;
          liveStockData.set(symbol, price);

          // Broadcast updates to all connected clients
          broadcastStockUpdate(symbol, price);
        });
      }
    } catch (error) {
      console.error('Error parsing Finnhub message:', error);
    }
  });

  finnhubSocket.on('error', (error) => {
    console.error('Finnhub WebSocket error:', error);
  });

  finnhubSocket.on('close', () => {
    console.log('Finnhub WebSocket closed, attempting reconnection...');
    setTimeout(initializeFinnhubSocket, 10000); // Attempt to reconnect
  });
}

// Initialize the Finnhub connection
initializeFinnhubSocket();

// WebSocket server connection handler
wss.on('connection', async (ws) => {
  console.log('New frontend client connected');
  clients.add(ws);

  // Send initial stock data to the new client
  try {
    const stocks = await prisma.stock.findMany();
    const stocksWithLiveData = stocks.map((stock) => ({
      ...stock,
      livePrice: liveStockData.get(stock.ticker) || null,
    }));
    ws.send(JSON.stringify({ type: 'initial', data: stocksWithLiveData }));
  } catch (error) {
    console.error('Error fetching initial stock data:', error);
  }

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  // Handle messages from client
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());

      switch (data.action) {
        case 'subscribe':
          await handleSubscription(data.symbol);
          break;
        case 'unsubscribe':
          await handleUnsubscription(data.symbol);
          break;
        // Add more cases as needed
      }
    } catch (error) {
      console.error('Error handling client message:', error);
    }
  });
});

// Broadcast stock updates to all connected clients
function broadcastStockUpdate(symbol, price) {
  const update = JSON.stringify({
    type: 'update',
    data: { symbol, price },
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(update); // Send the update to each connected client
    }
  });
}

// Handle stock subscription
async function handleSubscription(symbol) {
  if (!subscribedStocks.has(symbol)) {
    subscribedStocks.add(symbol); // Add the stock to subscribed set

    // Subscribe to the stock via Finnhub WebSocket
    if (finnhubSocket && finnhubSocket.readyState === WebSocket.OPEN) {
      finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol }));
      console.log(`Subscribed to ${symbol}`);
    }
  }
}

// Handle stock unsubscription
async function handleUnsubscription(symbol) {
  if (subscribedStocks.has(symbol)) {
    subscribedStocks.delete(symbol); // Remove from subscribed set

    // Unsubscribe from the stock via Finnhub WebSocket
    if (finnhubSocket && finnhubSocket.readyState === WebSocket.OPEN) {
      finnhubSocket.send(JSON.stringify({ type: 'unsubscribe', symbol }));
      console.log(`Unsubscribed from ${symbol}`);
    }
  }
}

// Helper function to prepare TensorFlow-compatible data
const prepareDataForTensorFlow = (timeSeriesData) => {
  const dataPoints = Object.values(timeSeriesData).map((entry) => ({
    open: parseFloat(entry["1. open"]),
    high: parseFloat(entry["2. high"]),
    low: parseFloat(entry["3. low"]),
    close: parseFloat(entry["4. close"]),
    volume: parseFloat(entry["5. volume"]),
  }));

  // Extract only closing prices for time-series analysis
  const closingPrices = dataPoints.map((point) => point.close);

  return tf.tensor(closingPrices);
};

// REST API endpoints
app.get('/favicon.ico', (req, res) => res.status(204));

app.get('/', (req, res) => {
  res.send('Backend is up!');
});

// Endpoint to fetch historical data
app.get("/analyze/:symbol", async (req, res) => {
  const { symbol } = req.params;
  const market = req.query.market || "USD"; // Default market is USD

  try {
    // Fetch historical data from Alpha Vantage
    const url = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${symbol}&market=${market}&apikey=YXBOAPWFAP7USWXN`;
    const response = await axios.get(url);

    if (!response.data["Time Series (Digital Currency Daily)"]) {
      return res.status(400).json({
        success: false,
        message: "Unable to fetch historical data. Check the symbol or API key.",
      });
    }

    const metaData = response.data["Meta Data"];
    const timeSeriesData = response.data["Time Series (Digital Currency Daily)"];

    // Prepare data for TensorFlow analysis
    const tensorData = prepareDataForTensorFlow(timeSeriesData);

    // Analyze data using TensorFlow (predicting price trends)
    const priceTrendPrediction = await predictPriceTrends(tensorData);

    // Respond with the results
    return res.status(200).json({
      success: true,
      metaData,
      predictions: {
        priceTrendPrediction,
        buySignal: priceTrendPrediction > 0 ? "Buy" : "Hold",
        riskLevel: calculateRiskLevel(priceTrendPrediction),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching data.",
    });
  }
});

app.get('/stocks', async (req, res) => {
  try {
    let stocks = await prisma.stock.findMany();

    if (stocks.length < 5) {
      const initialStocks = [
        'BINANCE:BTCUSDT', 'BINANCE:ETHUSDT',
        'BINANCE:BNBUSDT', 'BINANCE:ADAUSDT',
        'BINANCE:SOLUSDT',
      ];

      await Promise.all(
        initialStocks.slice(stocks.length).map(async (symbol) => {
          const livePrice = liveStockData.get(symbol);
          if (livePrice) {
            await prisma.stock.create({
              data: {
                ticker: symbol,
                name: symbol,
                quantity: 1,
                buyPrice: livePrice,
              },
            });
            // Subscribe to the new stock
            await handleSubscription(symbol);
          }
        })
      );

      stocks = await prisma.stock.findMany();
    }

    const stocksWithLiveData = stocks.map((stock) => ({
      ...stock,
      livePrice: liveStockData.get(stock.ticker) || null,
    }));

    res.json(stocksWithLiveData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stocks', error });
  }
});

app.post('/stocks/buy', async (req, res) => {
  const { ticker, quantityToBuy } = req.body;

  if (!ticker || !quantityToBuy || quantityToBuy <= 0) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  try {
    const stock = await prisma.stock.findUnique({ where: { ticker } });

    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    const updatedStock = await prisma.stock.update({
      where: { ticker },
      data: { quantity: stock.quantity + quantityToBuy },
    });

    await handleSubscription(ticker);

    res.json({
      message: `Bought ${quantityToBuy} shares of ${ticker}`,
      stock: updatedStock,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error buying stock', error });
  }
});

app.post('/stocks/sell', async (req, res) => {
  const { ticker, quantityToSell } = req.body;

  if (!ticker || !quantityToSell || quantityToSell <= 0) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  try {
    const stock = await prisma.stock.findUnique({ where: { ticker } });

    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    if (stock.quantity < quantityToSell) {
      return res.status(400).json({ message: 'Insufficient shares' });
    }

    const updatedStock = await prisma.stock.update({
      where: { ticker },
      data: { quantity: stock.quantity - quantityToSell },
    });

    if (updatedStock.quantity === 0) {
      await handleUnsubscription(ticker);
    }

    res.json({
      message: `Sold ${quantityToSell} shares of ${ticker}`,
      stock: updatedStock,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error selling stock', error });
  }
});

app.get('/stocks/realtime', async (req, res) => {
  try {
    // Fetch all subscribed tickers from the database
    const stocks = await prisma.stock.findMany();

    if (!stocks.length) {
      return res.status(404).json({ message: 'No subscribed tickers found' });
    }

    // Fetch real-time data for each ticker from the Finnhub REST API
    const realTimeDataPromises = stocks.map(async (stock) => {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${stock.ticker}&token=${API_KEY}`
      );

      if (!response.ok) {
        console.error(`Failed to fetch data for ${stock.ticker}`);
        return { ticker: stock.ticker, error: 'Failed to fetch data' };
      }

      const data = await response.json();
      return {
        ticker: stock.ticker,
        currentPrice: data.c, // Current price
        highPrice: data.h,    // High price
        lowPrice: data.l,     // Low price
        openPrice: data.o,    // Open price
        previousClose: data.pc, // Previous close
      };
    });

    const realTimeData = await Promise.all(realTimeDataPromises);

    res.json({
      message: 'Real-time data fetched successfully',
      data: realTimeData,
    });
  } catch (error) {
    console.error('Error fetching real-time data:', error);
    res.status(500).json({ message: 'Error fetching real-time data', error });
  }
});


// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// TensorFlow model to predict price trends
const predictPriceTrends = async (tensorData) => {
    // Create a simple linear regression model
    const model = tf.sequential();
  
    model.add(
      tf.layers.dense({
        units: 1,
        inputShape: [1],
        activation: "linear",
      })
    );
  
    model.compile({
      optimizer: tf.train.adam(),
      loss: "meanSquaredError",
    });
  
    // Use the tensor data as training data
    const xs = tensorData.slice(0, tensorData.size - 1); // Training data
    const ys = tensorData.slice(1); // Labels (next day's price)
  
    await model.fit(xs.reshape([xs.size, 1]), ys.reshape([ys.size, 1]), {
      epochs: 100,
      verbose: 0,
    });
  
    // Predict the trend for the next day
    const lastPrice = tensorData.dataSync()[tensorData.size - 1];
    const predictionTensor = model.predict(tf.tensor([lastPrice]).reshape([1, 1]));
  
    const prediction = predictionTensor.dataSync()[0];
    return prediction - lastPrice; // Return the trend (positive/negative)
  };
  
  // Calculate risk level based on trend
  const calculateRiskLevel = (trend) => {
    if (trend > 100) return "High";
    if (trend > 50) return "Medium";
    return "Low";
  };