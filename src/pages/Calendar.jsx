import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../hooks/useStore.jsx'
import { PageHeader } from '../components/InteractionCard.jsx'
import { getCalendarDays, getMonthName, isSameDay, formatRelativeDate } from '../utils/helpers.js'

const DOW = ['P', 'A', 'T', 'K', 'Pn', 'Š', 'S']

export default function Calendar() {
  const navigate = useNavigate()
  const { interactions, getFollowUps, getOverdueFollowUps, getClient } = useStore()

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState(null)

  const days = getCalendarDays(year, month)

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }
  const goToday = () => {
    setYear(now.getFullYear()); setMonth(now.getMonth())
    setSelectedDay(now.getDate())
  }

  const getDayDots = (day) => {
    if (!day) return []
    const date = new Date(year, month, day)
    const dots = []

    const hasVisit = interactions.some(i => isSameDay(i.date, date))
    if (hasVisit) dots.push('visit')

    const followUps = getFollowUps()
    const hasFollowUp = followUps.some(i => i.nextActionDate && isSameDay(i.nextActionDate, date))
    if (hasFollowUp) {
      const overdue = getOverdueFollowUps()
      const isOverdue = overdue.some(i => i.nextActionDate && isSameDay(i.nextActionDate, date))
      dots.push(isOverdue ? 'overdue' : 'followup')
    }

    return dots
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
  const isToday = (day) => day && isCurrentMonth && day === now.getDate()

  // Selected day data
  const selectedDate = selectedDay ? new Date(year, month, selectedDay) : null
  const dayInteractions = selectedDate
    ? interactions.filter(i => isSameDay(i.date, selectedDate)).sort((a, b) => new Date(b.date) - new Date(a.date))
    : []
  const dayFollowUps = selectedDate
    ? getFollowUps().filter(i => i.nextActionDate && isSameDay(i.nextActionDate, selectedDate))
    : []

  // Month summary
  const monthInteractions = interactions.filter(i => {
    const d = new Date(i.date)
    return d.getMonth() === month && d.getFullYear() === year
  })
  const monthFollowUps = getFollowUps().filter(i => {
    if (!i.nextActionDate) return false
    const d = new Date(i.nextActionDate)
    return d.getMonth() === month && d.getFullYear() === year
  })

  return (
    <div className="page-container animate-slide-up">
      <PageHeader title="Kalendorius" />

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="btn-ghost px-3 py-2 text-lg">‹</button>
        <div className="text-center">
          <p className="font-display font-bold text-xl uppercase tracking-wide text-slate-100 capitalize">
            {getMonthName(month, year)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToday} className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium">
            Šiandien
          </button>
          <button onClick={nextMonth} className="btn-ghost px-3 py-2 text-lg">›</button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card mb-4">
        {/* Day of week headers */}
        <div className="grid grid-cols-7 mb-2">
          {DOW.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-slate-500 uppercase py-1">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-y-1">
          {days.map((day, idx) => {
            const dots = getDayDots(day)
            const today = isToday(day)
            const selected = selectedDay === day

            return (
              <div key={idx}
                onClick={() => day && setSelectedDay(selected ? null : day)}
                className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all
                  ${day ? 'cursor-pointer hover:bg-slate-700/40' : ''}
                  ${today ? 'bg-brand-500/20 border border-brand-500/40' : ''}
                  ${selected && !today ? 'bg-slate-700/60 border border-slate-600/60' : ''}
                `}>
                {day ? (
                  <>
                    <span className={`text-sm font-medium leading-none
                      ${today ? 'text-brand-300 font-bold' : selected ? 'text-slate-100' : 'text-slate-300'}`}>
                      {day}
                    </span>
                    {dots.length > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {dots.map((dot, di) => (
                          <span key={di} className={`w-1 h-1 rounded-full
                            ${dot === 'visit' ? 'bg-brand-500' : ''}
                            ${dot === 'followup' ? 'bg-sky-400' : ''}
                            ${dot === 'overdue' ? 'bg-red-400' : ''}`} />
                        ))}
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-3 pt-3 border-t border-slate-700/40 justify-center">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-500" />
            <span className="text-xs text-slate-400">Vizitas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="text-xs text-slate-400">Follow-up</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-xs text-slate-400">Vėluoja</span>
          </div>
        </div>
      </div>

      {/* Selected day details */}
      {selectedDay && (
        <div className="animate-fade-in">
          <p className="section-title">
            {new Date(year, month, selectedDay).toLocaleDateString('lt-LT', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>

          {dayInteractions.length === 0 && dayFollowUps.length === 0 ? (
            <div className="card text-center py-6">
              <p className="text-slate-400 text-sm">Šiai dienai įrašų nėra</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {dayInteractions.map(i => {
                const client = getClient(i.clientId)
                return (
                  <div key={i.id} onClick={() => navigate(`/clients/${i.clientId}`)}
                    className="card-hover bg-brand-500/10 border-brand-500/30">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-brand-400 font-semibold uppercase tracking-wide">Vizitas</p>
                        <p className="text-sm font-semibold text-slate-100 truncate">{client?.companyName}</p>
                        {i.summary && <p className="text-xs text-slate-400 truncate mt-0.5">{i.summary}</p>}
                      </div>
                    </div>
                  </div>
                )
              })}

              {dayFollowUps.map(i => {
                const client = getClient(i.clientId)
                const isOverdue = new Date(i.nextActionDate) < new Date()
                return (
                  <div key={i.id} onClick={() => navigate(`/clients/${i.clientId}`)}
                    className={`card-hover border ${isOverdue ? 'bg-red-500/10 border-red-500/30' : 'bg-sky-500/10 border-sky-500/30'}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isOverdue ? 'text-red-400' : 'text-sky-400'}`}>
                      Follow-up
                    </p>
                    <p className="text-sm font-semibold text-slate-100 truncate">{client?.companyName}</p>
                    <p className="text-sm text-slate-300 mt-0.5">{i.nextAction}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Month summary (when no day selected) */}
      {!selectedDay && (
        <div className="animate-fade-in">
          <p className="section-title">Mėnesio apžvalga</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="card text-center">
              <p className="font-display font-bold text-3xl text-brand-400">{monthInteractions.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Vizitai</p>
            </div>
            <div className="card text-center">
              <p className="font-display font-bold text-3xl text-sky-400">{monthFollowUps.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Follow-ups</p>
            </div>
          </div>

          {monthFollowUps.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                Artimiausi Follow-ups
              </p>
              <div className="flex flex-col gap-2">
                {monthFollowUps.slice(0, 5).map(i => {
                  const client = getClient(i.clientId)
                  const overdue = new Date(i.nextActionDate) < new Date()
                  return (
                    <div key={i.id} onClick={() => navigate(`/clients/${i.clientId}`)}
                      className={`card-hover border ${overdue ? 'bg-red-500/10 border-red-500/30' : 'bg-sky-500/10 border-sky-500/30'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${overdue ? 'text-red-300' : 'text-sky-300'}`}>
                            {client?.companyName}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{i.nextAction}</p>
                        </div>
                        <span className={`text-xs flex-shrink-0 font-medium ${overdue ? 'text-red-400' : 'text-sky-400'}`}>
                          {formatRelativeDate(i.nextActionDate)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
