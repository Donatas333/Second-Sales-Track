import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../hooks/useStore.jsx'
import { PageHeader } from '../components/InteractionCard.jsx'
import { getClientInitials, formatRelativeDate } from '../utils/helpers.js'

export default function Clients() {
  const navigate = useNavigate()
  const { clients, getClientInteractions } = useStore()
  const [query, setQuery] = useState('')

  const filtered = clients.filter(c => {
    if (!query) return true
    const q = query.toLowerCase()
    return c.companyName.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.contactName.toLowerCase().includes(q)
  }).sort((a, b) => a.companyName.localeCompare(b.companyName, 'lt'))

  return (
    <div className="page-container animate-slide-up">
      <PageHeader title="Klientai">
        <button onClick={() => navigate('/clients/new')} className="btn-primary py-2 px-4 text-sm">
          + Naujas
        </button>
      </PageHeader>

      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Ieškoti pagal pavadinimą, miestą..."
        className="input-field mb-4 text-sm"
      />

      {filtered.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-slate-400">{query ? 'Nerasta klientų' : 'Pridėkite pirmą klientą'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(client => {
            const ci = getClientInteractions(client.id)
            const lastContact = ci[0]?.date
            const initials = getClientInitials(client.companyName)
            return (
              <div key={client.id} onClick={() => navigate(`/clients/${client.id}`)}
                className="card-hover flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-bold text-brand-400 text-sm">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-100 truncate">{client.companyName}</p>
                  <p className="text-xs text-slate-400 truncate">{client.city} · {client.contactName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-brand-400">{ci.length} vizit.</p>
                  {lastContact && (
                    <p className="text-xs text-slate-500">{formatRelativeDate(lastContact)}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
