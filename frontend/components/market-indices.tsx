export function MarketIndices() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-lg bg-zinc-900 p-4">
        <h3 className="text-sm font-medium text-zinc-400">NIFTY 50</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold">23,616.05</span>
          <span className="text-red-500">-388.70 (1.62%)</span>
        </div>
      </div>
      <div className="rounded-lg bg-zinc-900 p-4">
        <h3 className="text-sm font-medium text-zinc-400">BANK NIFTY</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold">49,922.00</span>
          <span className="text-red-500">-1,066.80 (2.09%)</span>
        </div>
      </div>
    </div>
  )
}

