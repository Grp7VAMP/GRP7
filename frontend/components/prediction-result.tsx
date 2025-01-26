import { ArrowUpCircle, ArrowDownCircle, AlertTriangle } from "lucide-react"

interface PredictionResultProps {
  result: {
    success: boolean
    metaData: {
      [key: string]: string
    }
    predictions: {
      priceTrendPrediction: number
      buySignal: "Buy" | "Hold"
      riskLevel: "Low" | "Medium" | "High"
    }
  }
}

export function PredictionResult({ result }: PredictionResultProps) {
  if (!result.success) {
    return (
      <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded-md text-red-700">
        Failed to fetch prediction. Please try again.
      </div>
    )
  }

  const { metaData, predictions } = result

  return (
    <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-md">
      <h3 className="text-lg font-semibold mb-2">Prediction Result</h3>
      <div className="space-y-2">
        <div>
          <span className="font-medium">Symbol:</span> {metaData["2. Digital Currency Code"]}
        </div>
        <div>
          <span className="font-medium">Market:</span> {metaData["4. Market Code"]}
        </div>
        <div>
          <span className="font-medium">Last Updated:</span> {metaData["6. Last Refreshed"]}
        </div>
        <div className="flex items-center">
          <span className="font-medium mr-2">Price Trend:</span>
          {predictions.priceTrendPrediction > 0 ? (
            <ArrowUpCircle className="text-green-500" />
          ) : (
            <ArrowDownCircle className="text-red-500" />
          )}
          <span className="ml-1">
            {predictions.priceTrendPrediction > 0 ? "Up" : "Down"} (
            {(predictions.priceTrendPrediction * 100).toFixed(2)}%)
          </span>
        </div>
        <div>
          <span className="font-medium">Buy Signal:</span>{" "}
          <span className={predictions.buySignal === "Buy" ? "text-green-600" : "text-yellow-600"}>
            {predictions.buySignal}
          </span>
        </div>
        <div className="flex items-center">
          <span className="font-medium mr-2">Risk Level:</span>
          <AlertTriangle
            className={`
            ${predictions.riskLevel === "Low" ? "text-green-500" : ""}
            ${predictions.riskLevel === "Medium" ? "text-yellow-500" : ""}
            ${predictions.riskLevel === "High" ? "text-red-500" : ""}
          `}
          />
          <span className="ml-1">{predictions.riskLevel}</span>
        </div>
      </div>
    </div>
  )
}

