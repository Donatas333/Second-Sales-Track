import { useNavigate } from 'react-router-dom'
import { getTypeInfo, formatRelativeDate, formatTime } from '../utils/helpers.js'
import { useStore } from '../hooks/useStore.jsx'

export function PageHeader({ title, back, children }) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-3 mb-4">
      {back && (
        <button
          onClick={() => navigate(back === true ? -1 : back)}
          className="btn-ghost p-2 -ml-2 text-slate-400"
        >
          ←
        </button>
      )}
      <h1 className="font-display font-bold text-2xl uppercase tracking-wide text-slate-100 flex-1">
        {title}
      </h1>
      {children}
    </div>
  )
}

export function TypeBadge({ type, size = 'sm' }) {
  const info = getTypeInfo(type)
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border font-medium
      ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
      ${info.bg} ${info.color}`}>
      <span>{info.icon}</span>
      <span>{info.label}</span>
    </span>
  )
}

export function InteractionCard({ interaction, showClient = true, onDelete }) {
  const { getClient } = useStore()
  const navigate = useNavigate()
  const client = getClient(interaction.clientId)
  const info = getTypeInfo(interaction.type)

  const handleDelete = (e) => {
    e.stopPropagation()
    if (window.confirm('Ištrinti šį vizitą?')) {
      onDelete?.(interaction.id)
    }
  }

  return (
    <div className={`card-hover ${info.bg} border`} onClick={() => navigate(`/clients/${interaction.clientId}`)}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <TypeBadge type={interaction.type} />
          {showClient && client && (
            <p className="text-slate-200 font-semibold mt-1 truncate">{client.companyName}</p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-slate-400">{formatTime(interaction.date)}</p>
          {onDelete && (
            <button onClick={handleDelete} className="text-slate-600 hover:text-red-400 text-xs mt-1 transition-colors">
              ✕
            </button>
          )}
        </div>
      </div>

      {interaction.summary && (
        <p className="text-slate-300 text-sm line-clamp-2 mb-2">{interaction.summary}</p>
      )}

      {interaction.products?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {interaction.products.slice(0, 3).map(p => (
            <span key={p.id} className="text-xs bg-slate-700/60 text-slate-300 rounded-md px-2 py-0.5 border border-slate-600/40">
              {p.brand} {p.name}
            </span>
          ))}
          {interaction.products.length > 3 && (
            <span className="text-xs text-slate-500">+{interaction.products.length - 3}</span>
          )}
        </div>
      )}

      {interaction.nextAction && (
        <div className={`flex items-center gap-2 text-xs rounded-lg px-2 py-1.5 mt-1
          ${new Date(interaction.nextActionDate) < new Date()
            ? 'bg-red-500/10 border border-red-500/30 text-red-300'
            : 'bg-sky-500/10 border border-sky-500/30 text-sky-300'
          }`}>
          <span>→</span>
          <span className="flex-1 truncate">{interaction.nextAction}</span>
          <span className="text-xs opacity-75 flex-shrink-0">
            {formatRelativeDate(interaction.nextActionDate)}
          </span>
        </div>
      )}
    </div>
  )
}
