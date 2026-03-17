import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './hooks/useStore.jsx'
import BottomNav from './components/BottomNav.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Clients from './pages/Clients.jsx'
import ClientFormPage from './pages/ClientFormPage.jsx'
import ClientDetail from './pages/ClientDetail.jsx'
import NewInteraction from './pages/NewInteraction.jsx'
import Interactions from './pages/Interactions.jsx'
import FollowUps from './pages/FollowUps.jsx'
import Calendar from './pages/Calendar.jsx'

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/new" element={<ClientFormPage />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/clients/:id/edit" element={<ClientFormPage />} />
          <Route path="/interactions" element={<Interactions />} />
          <Route path="/interactions/new" element={<NewInteraction />} />
          <Route path="/followups" element={<FollowUps />} />
          <Route path="/calendar" element={<Calendar />} />
        </Routes>
        <BottomNav />
      </BrowserRouter>
    </StoreProvider>
  )
}
