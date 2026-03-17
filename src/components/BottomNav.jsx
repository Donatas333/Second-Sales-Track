import { NavLink, useLocation } from 'react-router-dom'
import { useStore } from '../hooks/useStore.jsx'

export default function BottomNav() {
  const { getTodayInteractions, getOverdueFollowUps } = useStore()
  const todayCount = getTodayInteractions().length
  const overdueCount = getOverdueFollowUps().length

  const tabs = [
    { to: '/', icon: '⚡', label: 'Pagrindinis', exact: true },
    { to: '/clients', icon: '👥', label: 'Klientai' },
    { to: '/interactions', icon: '📋', label: 'Vizitai', badge: todayCount },
    { to: '/calendar', icon: '📅', label: 'Kalendorius' },
    { to: '/followups', icon: '🔔', label: 'Follow-ups', badge: overdueCount, badgeRed: true },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/60">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.exact}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 pt-1 gap-0.5 relative transition-colors duration-150
              ${isActive ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-500 rounded-b-full" />
                )}
                <span className="text-xl relative">
                  {tab.icon}
                  {tab.badge > 0 && (
                    <span className={`absolute -top-1 -right-2 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center
                      ${tab.badgeRed ? 'bg-red-500 text-white' : 'bg-brand-500 text-white'}`}>
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-medium leading-none">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
