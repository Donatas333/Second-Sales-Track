import { useNavigate } from 'react-router-dom'
import { useStore } from '../hooks/useStore.jsx'
import { PageHeader } from '../components/InteractionCard.jsx'
import { formatRelativeDate, isToday } from '../utils/helpers.js'

function FollowUpCard({ interaction, client, variant }) {
  const navigate = useNavigate()
  const colors = {
    overdue: 'bg-red-500/10 border-red-500/30',
    today: 'bg-brand-500/10 border-brand-500/30',
    upcoming: 'bg-sky-500/10 border-sky-500/30',
  }
  const textColors = {
    overdue: 'text-red-300',
    today: 'text-brand-300',
    upcoming: 'text-sky-300',
  }
  const dateColors = {
    overdue: 'text-red-400',
    today: 'text-brand-400',
    upcoming: 'text-sky-400',
  }

  return (
    <div onClick={() => navigate(`/clients/${interaction.clientId}`)}
      className={`card-hover border ${colors[variant]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${textColors[variant]} truncate`}>
            {client?.companyName}
          </p>
          <p className="text-sm text-slate-200 mt-0.5">{interaction.nextAction}</p>
          {interaction.products?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {interaction.products.slice(0, 2).map(p => (
                <span key={p.id} className="text-xs bg-slate-700/60 text-slate-400 rounded-md px-2 py-0.5 border border-slate-600/30">
                  {p.brand}
                </span>
              ))}
              {interaction.products.length > 2 && (
                <span className="text-xs text-slate-500">+{interaction.products.length - 2}</span>
              )}
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <span className={`text-xs font-semibold ${dateColors[variant]}`}>
            {formatRelativeDate(interaction.nextActionDate)}
          </span>
          {client?.city && (
            <p className="text-xs text-slate-500 mt-0.5">{client.city}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function FollowUps() {
  const { getFollowUps, getOverdueFollowUps, getClient } = useStore()

  const now = new Date()
  const allFollowUps = getFollowUps()
  const overdue = getOverdueFollowUps()
  const todayItems = allFollowUps.filter(i => isToday(i.nextActionDate) && new Date(i.nextActionDate) >= now)
  const upcoming = allFollowUps.filter(i => !isToday(i.nextActionDate) && new Date(i.nextActionDate) > now)

  const total = overdue.length + todayItems.length + upcoming.length

  return (
    <div className="page-container animate-slide-up">
      <PageHeader title="Follow-ups">
        {total > 0 && (
          <span className="bg-slate-700/60 border border-slate-600/50 text-slate-300 text-xs font-bold rounded-full px-3 py-1">
            {total} iš viso
          </span>
        )}
      </PageHeader>

      {total === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-slate-300 font-semibold">Viskas atlikta!</p>
          <p className="text-slate-500 text-sm mt-1">Nėra laukiančių veiksmų</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Overdue */}
          {overdue.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <p className="section-title text-red-400 mb-0">⚠️ Vėluojantys</p>
                <span className="bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold rounded-full px-2 py-0.5">
                  {overdue.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {overdue.map(i => (
                  <FollowUpCard key={i.id} interaction={i} client={getClient(i.clientId)} variant="overdue" />
                ))}
              </div>
            </div>
          )}

          {/* Today */}
          {todayItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <p className="section-title mb-0">📍 Šiandien</p>
                <span className="bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs font-bold rounded-full px-2 py-0.5">
                  {todayItems.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {todayItems.map(i => (
                  <FollowUpCard key={i.id} interaction={i} client={getClient(i.clientId)} variant="today" />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <p className="section-title mb-0">🗓 Artimiausi</p>
                <span className="bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-bold rounded-full px-2 py-0.5">
                  {upcoming.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {upcoming.map(i => (
                  <FollowUpCard key={i.id} interaction={i} client={getClient(i.clientId)} variant="upcoming" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
