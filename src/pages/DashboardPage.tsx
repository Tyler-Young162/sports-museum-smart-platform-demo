import { ArrowUpRight, BellRing, Camera, ChevronRight, CircleCheck, DoorOpen, MapPin, RadioTower, Wrench } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link } from 'react-router-dom'
import { dashboardConfig, overviewStats, recentAlarms, trendData } from '../data/overview'

const statusIcons = { video: Camera, access: DoorOpen, network: RadioTower, environment: CircleCheck }

export function DashboardPage() {
  return (
    <div className="page dashboard-page">
      <section className="page-command-row dashboard-command-row">
        <span className="dashboard-date">{dashboardConfig.dateLabel}　{dashboardConfig.openStatus}</span>
        <div className="heading-actions">
          <span className="live-indicator"><i />数据实时更新</span>
          <Link className="primary-button" to="/demo">进入演示控制台 <ArrowUpRight size={16} /></Link>
        </div>
      </section>

      <section className="stat-grid">
        {overviewStats.map((stat) => (
          <article className={`stat-card ${stat.tone}`} key={stat.label}>
            <div className="stat-top"><span>{stat.label}</span><ArrowUpRight size={17} /></div>
            <strong>{stat.value}</strong>
            <p>{stat.note}</p>
            <div className="stat-glow" />
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel trend-panel">
          <div className="panel-head">
            <div><p className="panel-kicker">今日趋势</p><h2>客流与事件态势</h2></div>
            <div className="legend"><span><i className="cyan" />客流</span><span><i className="orange" />告警</span></div>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 12, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="visitorFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#45c5ff" stopOpacity={0.35}/><stop offset="100%" stopColor="#45c5ff" stopOpacity={0}/></linearGradient>
                  <linearGradient id="alarmFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff9c5b" stopOpacity={0.22}/><stop offset="100%" stopColor="#ff9c5b" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid stroke="#20344e" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="time" stroke="#71829a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#71829a" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#0d1e33', border: '1px solid #263d5a', borderRadius: 10 }} />
                <Area type="monotone" dataKey="visitors" stroke="#45c5ff" fill="url(#visitorFill)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="alarms" stroke="#ff9c5b" fill="url(#alarmFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel venue-panel">
          <div className="panel-head">
            <div><p className="panel-kicker">空间态势</p><h2>场馆设备分布</h2></div>
            <Link to="/map">查看地图 <ChevronRight size={15} /></Link>
          </div>
          <div className="mini-map">
            <div className="map-zone zone-a">体育起源厅</div>
            <div className="map-zone zone-b">发展历程厅</div>
            <div className="map-zone zone-c">互动体验厅</div>
            <div className="map-zone zone-d">临时展厅</div>
            <span className="map-node alarm n1"><BellRing size={14} /></span>
            <span className="map-node camera n2"><Camera size={14} /></span>
            <span className="map-node access n3"><DoorOpen size={14} /></span>
            <span className="map-node normal n4"><MapPin size={14} /></span>
          </div>
          <div className="map-summary">{dashboardConfig.mapSummary.map((item) => <span key={item.label}><i className={item.tone} />{item.label} {item.value}</span>)}</div>
        </article>
      </section>

      <section className="dashboard-grid lower">
        <article className="panel alarm-panel">
          <div className="panel-head">
            <div><p className="panel-kicker">事件中心</p><h2>最新告警</h2></div>
            <Link to="/alarms">全部告警 <ChevronRight size={15} /></Link>
          </div>
          <div className="alarm-list">
            {recentAlarms.map((alarm) => (
              <div className="alarm-row" key={alarm.id}>
                <span className={`level ${alarm.level}`}>{alarm.level}</span>
                <div className="alarm-copy"><strong>{alarm.title}</strong><span><MapPin size={12} />{alarm.location}</span></div>
                <time>{alarm.time}</time>
                <span className="status-pill">{alarm.status}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel status-panel">
          <div className="panel-head"><div><p className="panel-kicker">设备健康度</p><h2>系统运行状态</h2></div><span className="health-score">96.8%</span></div>
          <div className="status-list">
            {dashboardConfig.systemStatus.map((item) => {
              const Icon = statusIcons[item.key as keyof typeof statusIcons]
              return (
              <div className="status-row" key={item.label}>
                <span className="status-icon"><Icon size={18} /></span>
                <div><strong>{item.label}</strong><span>{item.status}</span></div>
                <b>{item.value}</b>
                <i className={item.tone} />
              </div>
              )
            })}
          </div>
          <Link className="inline-action" to="/interfaces"><Wrench size={16} />查看系统接入状态</Link>
        </article>
      </section>
    </div>
  )
}
