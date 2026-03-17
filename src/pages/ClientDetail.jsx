import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../hooks/useStore.jsx'
import { PageHeader, TypeBadge } from '../components/InteractionCard.jsx'
import { getClientInitials, formatRelativeDate, formatDate, formatTime, getTypeInfo } from '../utils/helpers.js'

export default function ClientDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { getClient, deleteClient, getClientInteractions, deleteInteraction, getClientVehicleProfile, getClientTopProducts, getOverdueFollowUps } = useStore()

  const client = getClient(id)
  if (!client) return (
    <div className="page-container">
      <p className="text-slate-400 mt-10 text-center">Klientas nerastas</p>
    </div>
  )

  const interactions = getClientInteractions(id)
  const vehicleProfile = getClientVehicleProfile(id)
  const topProducts = getClientTopProducts(id)
  const maxVehicle = vehicleProfile[0]?.count || 1

  const allOverdue = getOverdueFollowUps()
  const clientOverdue = allOverdue.filter(i => i.clientId === id)
  const clientFollowups = interactions.filter(i => i.nextAction && i.nextActionDate && new Date(i.nextActionDate) >= new Date())

  const initials = getClientInitials(client.companyName)
  const thisMonth = interactions.filter(i => {
    const d = new Date(i.date), now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const handleDelete = () => {
    if (window.confirm(`Ištrinti klientą "${client.companyName}"? Bus ištrinti visi jo vizitai.`)) {
      deleteClient(id)
      navigate('/clients')
    }
  }

  const handleDeleteInteraction = (iid) => {
    if (window.confirm('Ištrinti šį vizitą?')) deleteInteraction(iid)
  }

  return (
    <div className="page-container animate-slide-up">
      <PageHeader title={client.companyName} back="/clients">
        <button onClick={() => navigate(`/clients/${id}/edit`)} className="btn-ghost text-sm py-1.5 px-3">✏️</button>
      </PageHeader>

      {/* Header card */}
      <div className="card mb-3 flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
          <span className="font-display font-bold text-brand-400 text-xl">{initials}</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-100">{client.contactName}</p>
          <p className="text-sm text-slate-400">{client.city}</p>
          {client.phone && (
            <a href={`tel:${client.phone}`} className="text-brand-400 text-sm hover:text-brand-300 transition-colors">
              {client.phone}
            </a>
          )}
        </div>
      </div>

      {client.notes && (
        <div className="card mb-3">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Pastabos</p>
          <p className="text-sm text-slate-300">{client.notes}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="card text-center">
          <p className="font-display font-bold text-2xl text-brand-400">{interactions.length}</p>
          <p className="text-xs text-slate-400">Iš viso</p>
        </div>
        <div className="card text-center">
          <p className="font-display font-bold text-2xl text-slate-100">{thisMonth.length}</p>
          <p className="text-xs text-slate-400">Šis mėn.</p>
        </div>
        <div className={`card text-center ${clientOverdue.length > 0 ? 'bg-red-500/10 border-red-500/30' : ''}`}>
          <p className={`font-display font-bold text-2xl ${clientOverdue.length > 0 ? 'text-red-400' : 'text-slate-400'}`}>
            {clientOverdue.length}
          </p>
          <p className="text-xs text-slate-400">Vėluoja</p>
        </div>
      </div>

      {/* CTA */}
      <button onClick={() => navigate(`/interactions/new?client=${id}`)}
        className="btn-primary w-full mb-4 flex items-center justify-center gap-2">
        <span>+</span> Pridėti vizitą
      </button>

      {/* Vehicle profile */}
      {vehicleProfile.length > 0 && (
        <div className="card mb-4">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Automobiliai</p>
          <div className="flex flex-col gap-2">
            {vehicleProfile.map(v => (
              <div key={v.make}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">{v.make}</span>
                  <span className="text-slate-500">{v.count}×</span>
                </div>
                <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full transition-all"
                    style={{ width: `${(v.count / maxVehicle) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top products */}
      {topProducts.length > 0 && (
        <div className="card mb-4">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Dažniausi produktai</p>
          <div className="flex flex-col gap-1">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b border-slate-700/30 last:border-0">
                <span className="text-xs font-bold text-brand-400 w-5">{p.count}×</span>
                <span className="text-sm text-slate-300 flex-1 truncate">{p.brand} {p.name}</span>
                <span className="text-xs text-slate-500">{p.vehicle}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overdue followups */}
      {clientOverdue.length > 0 && (
        <div className="mb-4">
          <p className="section-title text-red-400">⚠️ Vėluojantys veiksmai</p>
          <div className="flex flex-col gap-2">
            {clientOverdue.map(i => (
              <div key={i.id} className="card bg-red-500/10 border-red-500/30">
                <div className="flex justify-between gap-2">
                  <p className="text-sm text-slate-200">{i.nextAction}</p>
                  <span className="text-xs text-red-400 flex-shrink-0">{formatRelativeDate(i.nextActionDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open followups */}
      {clientFollowups.length > 0 && (
        <div className="mb-4">
          <p className="section-title">Planuojami veiksmai</p>
          <div className="flex flex-col gap-2">
            {clientFollowups.map(i => (
              <div key={i.id} className="card bg-sky-500/10 border-sky-500/30">
                <div className="flex justify-between gap-2">
                  <p className="text-sm text-slate-200">{i.nextAction}</p>
                  <span className="text-xs text-sky-400 flex-shrink-0">{formatRelativeDate(i.nextActionDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {interactions.length > 0 && (
        <div className="mb-4">
          <p className="section-title">Istorija</p>
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-700/60 rounded-full" />
            <div className="flex flex-col gap-4">
              {interactions.map((i, idx) => {
                const info = getTypeInfo(i.type)
                return (
                  <div key={i.id} className="relative">
                    <div className={`absolute -left-6 top-3 w-3 h-3 rounded-full border-2
                      ${idx === 0 ? 'bg-brand-500 border-brand-400' : 'bg-slate-600 border-slate-500'}`} />
                    <div className={`card ${info.bg} border`}>
                      <div className="flex items-center justify-between mb-1">
                        <TypeBadge type={i.type} />
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{formatDate(i.date)} {formatTime(i.date)}</span>
                          <button onClick={() => handleDeleteInteraction(i.id)}
                            className="text-slate-600 hover:text-red-400 transition-colors text-xs">✕</button>
                        </div>
                      </div>
                      {i.summary && <p className="text-sm text-slate-300 mb-2 line-clamp-2">{i.summary}</p>}
                      {i.products?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {i.products.map(p => (
                            <span key={p.id} className="text-xs bg-slate-700/60 text-slate-400 rounded px-2 py-0.5 border border-slate-600/30">
                              {p.brand} {p.name}
                            </span>
                          ))}
                        </div>
                      )}
                      {i.nextAction && (
                        <p className="text-xs text-sky-400 mt-2">→ {i.nextAction}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Delete client */}
      <div className="mt-4 pt-4 border-t border-slate-800">
        <button onClick={handleDelete} className="w-full py-3 text-sm text-red-400 hover:text-red-300 transition-colors">
          Ištrinti klientą
        </button>
      </div>
    </div>
  )
}
