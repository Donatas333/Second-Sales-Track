import { useState } from 'react'
import { useStore } from '../hooks/useStore.jsx'
import { PageHeader, InteractionCard } from '../components/InteractionCard.jsx'
import { groupByDate, formatDateDisplay, isToday } from '../utils/helpers.js'

const FILTERS = [
  { label: 'Visi', value: 'all' },
  { label: 'Šiandien', value: 'today' },
  { label: 'Vizitas', value: 'visit' },
  { label: 'Skambutis', value: 'phone' },
  { label: 'El. paštas', value: 'email' },
]

export default function Interactions() {
  const { interactions, deleteInteraction } = useStore()
  const [filter, setFilter] = useState('all')

  const filtered = interactions.filter(i => {
    if (filter === 'all') return true
    if (filter === 'today') return isToday(i.date)
    return i.type === filter
  }).sort((a, b) => new Date(b.date) - new Date(a.date))

  const grouped = groupByDate(filtered, 'date')

  return (
    <div className="page-container animate-slide-up">
      <PageHeader title="Vizitai" />

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`flex-shrink-0 text-xs font-semibold rounded-xl px-4 py-2 border transition-all
              ${filter === f.value
                ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
                : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:bg-slate-700/60'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-slate-400 text-2xl mb-2">📋</p>
          <p className="text-slate-400">Vizitų nerasta</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {grouped.map(([dateKey, items]) => (
            <div key={dateKey}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 px-1">
                {isToday(items[0].date) ? '📍 Šiandien' : formatDateDisplay(items[0].date)}
                <span className="ml-2 text-slate-600">{items.length}</span>
              </p>
              <div className="flex flex-col gap-2">
                {items.map(i => (
                  <InteractionCard key={i.id} interaction={i} onDelete={deleteInteraction} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
