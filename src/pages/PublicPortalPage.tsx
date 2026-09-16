import { Accessibility, ArrowRight, CalendarDays, ChevronRight, Clock3, Compass, Headphones, MapPin, MoveRight, Sparkles, Ticket, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import publicConfig from '../../config/public.json'
import { ModeSwitch } from '../components/ModeSwitch'
import { projectConfig } from '../config/project'

const serviceIcons = { 'S-ROUTE': Compass, 'S-GUIDE': Headphones, 'S-ACCESS': Accessibility, 'S-EVENT': Ticket }

export function PublicPortalPage() {
  return <div className="public-portal">
    <header className="public-header">
      <Link className="public-brand" to="/portal"><span className="public-logo">体</span><div><strong>{projectConfig.venueName}</strong><small>{projectConfig.englishName}</small></div></Link>
      <nav><a href="#exhibitions">展览导览</a><a href="#activities">今日活动</a><a href="#services">参观服务</a><a href="#visit">开放信息</a></nav>
      <div className="public-header-actions"><span className="public-demo-tag">场馆信息</span><ModeSwitch mode="public"/></div>
    </header>

    <main>
      <section className="public-hero" id="visit">
        <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
        <div className="hero-copy"><p>{publicConfig.hero.eyebrow}</p><h1>{publicConfig.hero.title}</h1><span>{publicConfig.hero.description}</span><div className="hero-actions"><a href="#exhibitions">开始探索 <ArrowRight size={17}/></a><a className="ghost" href="#activities"><CalendarDays size={16}/>查看今日活动</a></div></div>
        <aside className="visit-card"><div className="visit-card-head"><span><Clock3 size={18}/></span><div><small>今日开放时间</small><strong>{publicConfig.hero.openHours}</strong></div></div><p>{publicConfig.hero.lastEntry}</p><div className="visit-line"/><span className="open-note"><i/>{publicConfig.hero.notice}</span><div className="mini-route"><span>推荐路线</span><strong>序厅 → 起源 → 发展 → 冠军 → 互动</strong></div></aside>
      </section>

      <section className="public-stats">{publicConfig.stats.map((item) => <article key={item.label}><span>{item.label}</span><strong>{item.value}</strong><small>{item.unit}</small></article>)}</section>

      <section className="public-section" id="exhibitions"><SectionHead eyebrow="EXPLORE" title="正在开放的展览" description="从历史、城市、冠军到互动体验，选择你感兴趣的参观路径。"/><div className="exhibition-grid">{publicConfig.exhibitions.map((item, index) => <article className={`exhibition-card ${item.tone}`} key={item.id}><div className="exhibition-visual"><span>0{index + 1}</span><Sparkles size={30}/><i/></div><div className="exhibition-copy"><div><span>{item.floor} · {item.area}</span><b>{item.status}</b></div><h3>{item.title}</h3><p>{item.summary}</p><footer><small><Clock3 size={13}/>{item.duration}</small><button>查看展览 <ChevronRight size={14}/></button></footer></div></article>)}</div></section>

      <section className="public-section activities-section" id="activities"><div><SectionHead eyebrow="TODAY'S PROGRAM" title="今日活动" description="讲解、课程和精选路线由场馆运营系统统一维护。"/><div className="activity-list">{publicConfig.activities.map((item) => <article key={`${item.time}-${item.title}`}><time>{item.time}</time><div><strong>{item.title}</strong><span><MapPin size={13}/>{item.place}</span></div><b>{item.availability}</b><button>查看详情 <MoveRight size={14}/></button></article>)}</div></div><aside className="public-flow-card"><div><Users size={25}/><span>实时参观建议</span></div><strong>当前客流舒适</strong><p>互动体验区预计排队8分钟，建议先参观二层冠军荣誉厅。</p><div className="flow-bars"><i style={{height:'38%'}}/><i style={{height:'52%'}}/><i style={{height:'72%'}}/><i style={{height:'44%'}}/><i style={{height:'31%'}}/><i style={{height:'48%'}}/></div><small>最近6个时段客流趋势</small></aside></section>

      <section className="public-section" id="services"><SectionHead eyebrow="VISITOR SERVICES" title="参观服务" description="将导览、预约和场馆服务集中在同一个公众入口。"/><div className="service-grid">{publicConfig.services.map((item) => { const Icon = serviceIcons[item.id as keyof typeof serviceIcons]; return <article key={item.id}><span><Icon size={23}/></span><h3>{item.title}</h3><p>{item.description}</p><button>{item.action}<ChevronRight size={14}/></button></article> })}</div></section>
    </main>

    <footer className="public-footer"><div><strong>{projectConfig.venueName}</strong><span>场馆开放、活动及客流信息由综合管理平台统一发布。</span></div><ModeSwitch mode="public"/></footer>
  </div>
}

function SectionHead({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="public-section-head"><p>{eyebrow}</p><h2>{title}</h2><span>{description}</span></div>
}
