import {
  AlarmClock,
  Antenna,
  BellRing,
  Blocks,
  CarFront,
  ChevronRight,
  ClipboardCheck,
  Gauge,
  LayoutDashboard,
  Map,
  MonitorPlay,
  Music2,
  RadioTower,
  Search,
  Settings2,
  ShieldCheck,
  Video,
  X,
} from 'lucide-react'
import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { moduleConfig, projectConfig } from '../config/project'
import { useDemo } from '../context/DemoContext'

const icons = {
  dashboard: LayoutDashboard,
  alarms: BellRing,
  video: Video,
  access: ShieldCheck,
  publishing: MonitorPlay,
  workorders: ClipboardCheck,
  map: Map,
  environment: Gauge,
  audio: Music2,
  network: RadioTower,
  interfaces: Blocks,
  demo: Settings2,
}

export function AppShell() {
  const location = useLocation()
  const currentModule = moduleConfig.find((item) => item.path === location.pathname) ?? moduleConfig[0]
  const { scenarioMessage, clearScenarioMessage } = useDemo()

  useEffect(() => {
    if (!scenarioMessage) return
    const timer = window.setTimeout(clearScenarioMessage, 3600)
    return () => window.clearTimeout(timer)
  }, [scenarioMessage, clearScenarioMessage])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Antenna size={24} /></div>
          <div>
            <strong>{projectConfig.shortName}</strong>
            <span>{projectConfig.englishName}</span>
          </div>
        </div>

        <nav className="main-nav" aria-label="主导航">
          {moduleConfig.map((item) => {
            const Icon = icons[item.key as keyof typeof icons]
            return (
              <NavLink key={item.key} to={item.path} end={item.path === '/'} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <Icon size={19} />
                <span>{item.label}</span>
                <ChevronRight className="nav-arrow" size={15} />
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-foot">
          <div className="connection-dot" />
          <div><strong>模拟服务正常</strong><span>DATA MODE · MOCK</span></div>
        </div>
      </aside>

      <main className="main-stage">
        <header className="topbar">
          <div className="breadcrumb">
            <span>智慧场馆</span><ChevronRight size={14} /><strong>{currentModule.label}</strong>
          </div>
          <div className="topbar-actions">
            <label className="global-search">
              <Search size={17} />
              <input aria-label="全局搜索" placeholder="搜索设备、告警或工单" />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button" aria-label="告警通知"><AlarmClock size={19} /><i /></button>
            <div className="mock-badge">演示数据</div>
            <div className="operator-avatar">管</div>
          </div>
        </header>
        <div className="page-scroll"><Outlet /></div>
      </main>
      {scenarioMessage && <div className="demo-toast global-demo-toast"><BellRing size={15} /><span>{scenarioMessage}</span><button onClick={clearScenarioMessage}><X size={13} /></button></div>}
    </div>
  )
}
