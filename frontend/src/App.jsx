// FILE: src/App.jsx  (REPLACE existing)
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Overview from './pages/Overview'
import Leads from './pages/Leads'
import LeadDetail from './pages/LeadDetail'
import Messages from './pages/Messages'
import Events from './pages/Events'
import Campaigns from './pages/Campaigns'
import OutreachLogs from './pages/OutreachLogs'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="leads" element={<Leads />} />
          <Route path="leads/:leadId" element={<LeadDetail />} />
          <Route path="messages" element={<Messages />} />
          <Route path="events" element={<Events />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="outreach" element={<OutreachLogs />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}