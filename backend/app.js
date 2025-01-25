import express from "express"
import axios  from "axios"
import tf from "@tensorflow/tfjs";

const app = express();
const API_KEY = "7IX4Q6DLTBXM3SCX"; // Replace with your Alpha Vantage API key

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

// Endpoint to fetch historical data
app.get("/api/analyze/:symbol", async (req, res) => {
  const { symbol } = req.params;
  const market = req.query.market || "USD"; // Default market is USD

  try {
    // Fetch historical data from Alpha Vantage
    const url = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${symbol}&market=${market}&apikey=${API_KEY}`;
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

// Start the server
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
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
  