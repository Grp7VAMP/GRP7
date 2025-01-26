import { Info } from "lucide-react"

export function FAndO() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Futures & Options</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">What are Futures & Options?</h3>
        <p className="mb-4">
          Futures and Options (F&O) are financial instruments that allow traders to speculate on the future price
          movements of various assets, including stocks, commodities, and currencies.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Futures</h4>
            <p>Contracts to buy or sell an asset at a predetermined price on a specific future date.</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Options</h4>
            <p>
              Contracts that give the right (but not the obligation) to buy or sell an asset at a specific price within
              a set time frame.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Popular F&O Contracts</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Symbol</th>
              <th className="text-right py-2">LTP</th>
              <th className="text-right py-2">Change</th>
              <th className="text-right py-2">Volume</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">NIFTY 18MAY23 18000 CE</td>
              <td className="text-right">245.65</td>
              <td className="text-right text-green-500">+12.30 (5.27%)</td>
              <td className="text-right">1,23,456</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">BANKNIFTY 18MAY23 42000 PE</td>
              <td className="text-right">187.20</td>
              <td className="text-right text-red-500">-8.45 (4.32%)</td>
              <td className="text-right">98,765</td>
            </tr>
            <tr>
              <td className="py-2">RELIANCE 25MAY23 2400 CE</td>
              <td className="text-right">35.80</td>
              <td className="text-right text-green-500">+1.65 (4.83%)</td>
              <td className="text-right">54,321</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
        <Info className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-700">
          F&O trading involves high risk and requires in-depth knowledge of market dynamics. It's recommended for
          experienced traders only.
        </p>
      </div>
    </div>
  )
}

