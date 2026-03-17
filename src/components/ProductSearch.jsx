import { useState, useRef } from 'react'
import { searchProducts } from '../data/products.js'

export default function ProductSearch({ selectedProducts, onChange }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [focused, setFocused] = useState(false)
  const timeoutRef = useRef(null)

  const handleQuery = (q) => {
    setQuery(q)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setResults(q.length >= 2 ? searchProducts(q) : [])
    }, 150)
  }

  const addProduct = (product) => {
    if (!selectedProducts.find(p => p.id === product.id)) {
      onChange([...selectedProducts, product])
    }
    setQuery('')
    setResults([])
  }

  const removeProduct = (id) => {
    onChange(selectedProducts.filter(p => p.id !== id))
  }

  return (
    <div>
      {selectedProducts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedProducts.map(p => (
            <div key={p.id}
              className="flex items-center gap-2 bg-brand-500/15 border border-brand-500/30 rounded-xl px-3 py-1.5">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-brand-300">{p.brand}</p>
                <p className="text-xs text-slate-200 truncate max-w-[160px]">{p.name}</p>
                {p.vehicle && <p className="text-[10px] text-slate-500">{p.vehicle}</p>}
              </div>
              <button onClick={() => removeProduct(p.id)}
                className="text-slate-500 hover:text-red-400 transition-colors ml-1 flex-shrink-0">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => handleQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Ieškoti produkto (pavadinimas, gamintojas, automobilis)..."
          className="input-field text-sm"
        />

        {focused && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-slate-800 border border-slate-700/60 rounded-xl overflow-hidden shadow-xl">
            {results.map(p => (
              <button
                key={p.id}
                onClick={() => addProduct(p)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/60 transition-colors text-left border-b border-slate-700/40 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-400">{p.brand}</span>
                    <span className="text-xs text-slate-500">{p.sku}</span>
                  </div>
                  <p className="text-sm text-slate-200 truncate">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.vehicle}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
