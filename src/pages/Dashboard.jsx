import { useNavigate } from 'react-router-dom'
import { useStore } from '../hooks/useStore.jsx'
import { InteractionCard } from '../components/InteractionCard.jsx'
import { getGreeting, formatRelativeDate, getClientInitials, formatDate } from '../utils/helpers.js'

export default function Dashboard() {
  const navigate = useNavigate()
  const { getStats, getTodayInteractions, getFollowUps, getOverdueFollowUps, getClient, deleteInteraction } = useStore()

  const stats = getStats()
  const todayList = getTodayInteractions()
  const followUps = getFollowUps()
  const overdue = getOverdueFollowUps()
  const upcoming = followUps.filter(i => new Date(i.nextActionDate) >= new Date()).slice(0, 3)

  const today = new Date().toLocaleDateString('lt-LT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="page-container animate-slide-up">
      {/* Greeting */}
      <div className="mb-5">
        <p className="text-slate-400 text-sm font-medium capitalize">{today}</p>
        <h1 className="font-display font-bold text-3xl uppercase tracking-wide text-slate-100 mt-0.5">
          {getGreeting()} 👋
        </h1>
      </div>

      {/* CTA Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button onClick={() => navigate('/interactions/new')} className="btn-primary flex items-center justify-center gap-2 py-4 text-sm">
          <span className="text-lg">+</span> Naujas vizitas
        </button>
        <button onClick={() => navigate('/clients/new')} className="btn-secondary flex items-center justify-center gap-2 py-4 text-sm">
          <span className="text-lg">+</span> Naujas klientas
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="card text-center">
          <p className="font-display font-bold text-3xl text-brand-400">{todayList.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Šiandien</p>
        </div>
        <div className={`card text-center ${stats.overdueCount > 0 ? 'bg-red-500/10 border-red-500/30' : ''}`}>
          <p className={`font-display font-bold text-3xl ${stats.overdueCount > 0 ? 'text-red-400' : 'text-slate-300'}`}>
            {stats.overdueCount}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Vėluoja</p>
        </div>
        <div className="card text-center">
          <p className="font-display font-bold text-3xl text-slate-100">{stats.thisMonthCount}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {stats.thisMonthCount >= stats.lastMonthCount ? '↑' : '↓'} Mėn.
          </p>
        </div>
      </div>

      {/* Dormant clients alert */}
      {stats.dormantClients.length > 0 && (
        <div className="card bg-amber-500/10 border-amber-500/30 mb-5">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2">
            ⚠️ Nelankyti 30+ dienų
          </p>
          <div className="flex flex-wrap gap-2">
            {stats.dormantClients.map(c => (
              <button key={c.id} onClick={() => navigate(`/clients/${c.id}`)}
                className="bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs rounded-lg px-3 py-1.5 transition-colors font-medium">
                {c.companyName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Today's interactions */}
      {todayList.length > 0 && (
        <div className="mb-5">
          <p className="section-title">Šiandien</p>
          <div className="flex flex-col gap-2">
            {todayList.map(i => (
              <InteractionCard key={i.id} interaction={i} onDelete={deleteInteraction} />
            ))}
          </div>
        </div>
      )}

      {/* Overdue follow-ups */}
      {overdue.length > 0 && (
        <div className="mb-5">
          <p className="section-title text-red-400">⚠️ Vėluojantys</p>
          <div className="flex flex-col gap-2">
            {overdue.map(i => {
              const client = getClient(i.clientId)
              return (
                <div key={i.id} onClick={() => navigate(`/clients/${i.clientId}`)}
                  className="card-hover bg-red-500/10 border-red-500/30">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-red-300">{client?.companyName}</p>
                      <p className="text-sm text-slate-300 mt-0.5">{i.nextAction}</p>
                    </div>
                    <span className="text-xs text-red-400 flex-shrink-0 font-medium">
                      {formatRelativeDate(i.nextActionDate)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Upcoming follow-ups */}
      {upcoming.length > 0 && (
        <div className="mb-5">
          <p className="section-title">Artimiausi veiksmai</p>
          <div className="flex flex-col gap-2">
            {upcoming.map(i => {
              const client = getClient(i.clientId)
              return (
                <div key={i.id} onClick={() => navigate(`/clients/${i.clientId}`)}
                  className="card-hover bg-sky-500/10 border-sky-500/30">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-sky-300">{client?.companyName}</p>
                      <p className="text-sm text-slate-300 mt-0.5">{i.nextAction}</p>
                    </div>
                    <span className="text-xs text-sky-400 flex-shrink-0 font-medium">
                      {formatRelativeDate(i.nextActionDate)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Top products */}
      {stats.topProducts.length > 0 && (
        <div>
          <p className="section-title">Populiariausi produktai</p>
          <div className="card">
            {stats.topProducts.map((p, idx) => (
              <div key={idx} className={`flex items-center justify-between py-2 ${idx < stats.topProducts.length - 1 ? 'border-b border-slate-700/40' : ''}`}>
                <span className="text-sm text-slate-300 truncate flex-1">{p.name}</span>
                <span className="text-xs font-bold text-brand-400 ml-2">{p.count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
