import { Info } from "lucide-react"

export function MutualFunds() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mutual Funds</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">What are Mutual Funds?</h3>
        <p className="mb-4">
          Mutual funds are investment vehicles that pool money from multiple investors to purchase a diversified
          portfolio of stocks, bonds, or other securities. They are managed by professional fund managers.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Types of Mutual Funds</h4>
            <ul className="list-disc list-inside">
              <li>Equity Funds</li>
              <li>Debt Funds</li>
              <li>Hybrid Funds</li>
              <li>Index Funds</li>
              <li>Sector Funds</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Benefits of Mutual Funds</h4>
            <ul className="list-disc list-inside">
              <li>Professional Management</li>
              <li>Diversification</li>
              <li>Liquidity</li>
              <li>Affordability</li>
              <li>Transparency</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Mutual Funds</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Fund Name</th>
              <th className="text-right py-2">NAV</th>
              <th className="text-right py-2">1Y Returns</th>
              <th className="text-right py-2">3Y Returns</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">Axis Bluechip Fund</td>
              <td className="text-right">45.67</td>
              <td className="text-right text-green-500">15.8%</td>
              <td className="text-right text-green-500">12.5%</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">Mirae Asset Large Cap Fund</td>
              <td className="text-right">68.92</td>
              <td className="text-right text-green-500">18.2%</td>
              <td className="text-right text-green-500">14.7%</td>
            </tr>
            <tr>
              <td className="py-2">SBI Small Cap Fund</td>
              <td className="text-right">92.34</td>
              <td className="text-right text-green-500">22.5%</td>
              <td className="text-right text-green-500">19.3%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
        <Info className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          Mutual funds are subject to market risks. Read all scheme-related documents carefully before investing. Past
          performance is not indicative of future returns.
        </p>
      </div>
    </div>
  )
}

