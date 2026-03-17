import { createContext, useContext, useState, useEffect } from 'react'
import { seedClients, seedInteractions } from '../data/seeds.js'
import { nanoid } from 'nanoid'

const StoreContext = createContext(null)

const CLIENTS_KEY = 'at_clients'
const INTERACTIONS_KEY = 'at_interactions'

function loadFromStorage(key, seed) {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
    localStorage.setItem(key, JSON.stringify(seed))
    return seed
  } catch {
    return seed
  }
}

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

export function StoreProvider({ children }) {
  const [clients, setClients] = useState(() => loadFromStorage(CLIENTS_KEY, seedClients))
  const [interactions, setInteractions] = useState(() => loadFromStorage(INTERACTIONS_KEY, seedInteractions))

  useEffect(() => { saveToStorage(CLIENTS_KEY, clients) }, [clients])
  useEffect(() => { saveToStorage(INTERACTIONS_KEY, interactions) }, [interactions])

  // CLIENTS
  const addClient = (data) => {
    const client = { ...data, id: nanoid(), createdAt: new Date().toISOString() }
    setClients(prev => [client, ...prev])
    return client
  }

  const updateClient = (id, data) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
  }

  const deleteClient = (id) => {
    setClients(prev => prev.filter(c => c.id !== id))
    setInteractions(prev => prev.filter(i => i.clientId !== id))
  }

  const getClient = (id) => clients.find(c => c.id === id)

  // INTERACTIONS
  const addInteraction = (data) => {
    const interaction = { ...data, id: nanoid(), createdAt: new Date().toISOString() }
    setInteractions(prev => [interaction, ...prev])
    return interaction
  }

  const updateInteraction = (id, data) => {
    setInteractions(prev => prev.map(i => i.id === id ? { ...i, ...data } : i))
  }

  const deleteInteraction = (id) => {
    setInteractions(prev => prev.filter(i => i.id !== id))
  }

  const getClientInteractions = (clientId) => {
    return interactions
      .filter(i => i.clientId === clientId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  const getTodayInteractions = () => {
    const today = new Date()
    return interactions.filter(i => {
      const d = new Date(i.date)
      return d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  const getFollowUps = () => {
    return interactions
      .filter(i => i.nextAction && i.nextActionDate)
      .sort((a, b) => new Date(a.nextActionDate) - new Date(b.nextActionDate))
  }

  const getOverdueFollowUps = () => {
    const now = new Date()
    return interactions.filter(i => i.nextAction && i.nextActionDate && new Date(i.nextActionDate) < now)
  }

  const getClientVehicleProfile = (clientId) => {
    const ci = getClientInteractions(clientId)
    const makes = {}
    ci.forEach(i => {
      (i.products || []).forEach(p => {
        if (p.vehicle) {
          const make = p.vehicle.split(' ')[0]
          makes[make] = (makes[make] || 0) + 1
        }
      })
    })
    return Object.entries(makes)
      .map(([make, count]) => ({ make, count }))
      .sort((a, b) => b.count - a.count)
  }

  const getStats = () => {
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    const thisMonth = interactions.filter(i => new Date(i.date) >= thisMonthStart)
    const lastMonth = interactions.filter(i => {
      const d = new Date(i.date)
      return d >= lastMonthStart && d <= lastMonthEnd
    })

    // Top products this month
    const productCounts = {}
    thisMonth.forEach(i => {
      (i.products || []).forEach(p => {
        const key = `${p.brand} ${p.name}`
        productCounts[key] = (productCounts[key] || 0) + 1
      })
    })
    const topProducts = Object.entries(productCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Dormant clients (no contact 30+ days)
    const thirtyDaysAgo = new Date(now - 30 * 86400000)
    const dormantClients = clients.filter(client => {
      const ci = getClientInteractions(client.id)
      if (ci.length === 0) return true
      return new Date(ci[0].date) < thirtyDaysAgo
    })

    const overdue = getOverdueFollowUps()

    return {
      thisMonthCount: thisMonth.length,
      lastMonthCount: lastMonth.length,
      topProducts,
      dormantClients,
      overdueCount: overdue.length,
      avgPerDay: thisMonth.length > 0 ? (thisMonth.length / now.getDate()).toFixed(1) : 0,
    }
  }

  const getClientTopProducts = (clientId) => {
    const ci = getClientInteractions(clientId)
    const counts = {}
    ci.forEach(i => {
      (i.products || []).forEach(p => {
        const key = `${p.brand} ${p.name}`
        if (!counts[key]) counts[key] = { ...p, count: 0 }
        counts[key].count++
      })
    })
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 6)
  }

  return (
    <StoreContext.Provider value={{
      clients,
      interactions,
      addClient, updateClient, deleteClient, getClient,
      addInteraction, updateInteraction, deleteInteraction,
      getClientInteractions, getTodayInteractions,
      getFollowUps, getOverdueFollowUps,
      getClientVehicleProfile, getStats,
      getClientTopProducts,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
