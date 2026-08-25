import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { VideoPage } from './pages/VideoPage'
import { AccessPage, AlarmsPage, AudioPage, DemoConsolePage, EnvironmentPage, InterfacesPage, MapPage, NetworkPage, PublishingPage, WorkOrdersPage } from './pages/PlatformPages'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="alarms" element={<AlarmsPage />} />
        <Route path="video" element={<VideoPage />} />
        <Route path="access" element={<AccessPage />} />
        <Route path="publishing" element={<PublishingPage />} />
        <Route path="workorders" element={<WorkOrdersPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="environment" element={<EnvironmentPage />} />
        <Route path="audio" element={<AudioPage />} />
        <Route path="network" element={<NetworkPage />} />
        <Route path="interfaces" element={<InterfacesPage />} />
        <Route path="demo" element={<DemoConsolePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
