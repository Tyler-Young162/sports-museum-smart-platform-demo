import {
  Activity,
  AlarmClock,
  Antenna,
  BadgeCheck,
  BatteryCharging,
  BellRing,
  CalendarClock,
  Camera,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CirclePause,
  ClipboardCheck,
  Clock3,
  CloudUpload,
  Cpu,
  DoorOpen,
  Download,
  FileImage,
  Gauge,
  HardDrive,
  Image as ImageIcon,
  Info,
  Layers3,
  ListFilter,
  MapPin,
  Maximize,
  MonitorPlay,
  Music2,
  Network,
  Pause,
  Play,
  Plus,
  QrCode,
  RadioTower,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ServerCog,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Smartphone,
  Flame as SmokeDetector,
  ThermometerSun,
  TimerReset,
  UserCheck,
  Users,
  Volume2,
  Wifi,
  Wrench,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react'
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link } from 'react-router-dom'
import { useBackend, type DeviceAsset } from '../context/BackendContext'
import { useDemo } from '../context/DemoContext'
import {
  accessPoints,
  audioZones,
  demoScenarios,
  displayScreens,
  mapNodes,
  publishingTasks,
  sensors,
  systemInterfaces,
  upsDevices,
  type AlarmLevel,
  type AlarmRecord,
  type AlarmStatus,
  type WorkOrderRecord,
} from '../data/platformMock'

function PageTitle({ action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return action ? <section className="page-command-row">{action}</section> : null
}

function StatusChip({ value }: { value: string }) {
  const tone = ['严重', '紧急', '故障', '离线', '拒绝', '部分失败'].includes(value) ? 'danger' : ['一般', '高', '预警', '处理中', '高负载', '待验收'].includes(value) ? 'warning' : ['在线', '正常', '通过', '已完成', '播放中', '已入场', '在馆', '已关闭'].includes(value) ? 'success' : 'info'
  return <span className={`data-chip ${tone}`}>{value}</span>
}

function EmptySearch() {
  return <div className="table-empty"><Search size={24} /><strong>没有匹配的数据</strong><span>请调整搜索或筛选条件</span></div>
}

export function AlarmsPage() {
  const { alarms, acknowledgeAlarm, dispatchAlarm, closeAlarm } = useDemo()
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState<'全部' | AlarmLevel>('全部')
  const [status, setStatus] = useState<'全部' | AlarmStatus>('全部')
  const [selectedId, setSelectedId] = useState(alarms[0]?.id ?? '')
  const selected = alarms.find((item) => item.id === selectedId) ?? alarms[0]
  const filtered = alarms.filter((alarm) => {
    const keyword = query.trim().toLowerCase()
    return (level === '全部' || alarm.level === level) && (status === '全部' || alarm.status === status) && (!keyword || [alarm.id, alarm.title, alarm.type, alarm.location, alarm.device].some((value) => value.toLowerCase().includes(keyword)))
  })
  const openCount = alarms.filter((item) => item.status !== '已关闭').length

  return <div className="page operations-page">
    <PageTitle eyebrow="ALARM OPERATION CENTER" title="告警中心管理" description="统一接收设备与馆内事件告警，形成确认、派单、处置和关闭闭环" action={<button className="primary-button" onClick={() => setSelectedId(alarms.find((item) => item.status === '待确认')?.id ?? alarms[0].id)}><BellRing size={16} />查看待确认告警</button>} />
    <section className="metric-row five">
      <Metric label="今日告警" value={String(alarms.length)} note="较昨日 -8%" tone="cyan" icon={BellRing} />
      <Metric label="待确认" value={String(alarms.filter((item) => item.status === '待确认').length)} note="需要值班员确认" tone="red" icon={CircleAlert} />
      <Metric label="处理中" value={String(alarms.filter((item) => item.status === '处理中').length)} note="已派单或现场处置" tone="orange" icon={Clock3} />
      <Metric label="已关闭" value={String(alarms.filter((item) => item.status === '已关闭').length)} note="今日处置完成" tone="green" icon={CheckCircle2} />
      <Metric label="平均响应" value="2m36s" note={`${openCount}条未关闭`} tone="purple" icon={TimerReset} />
    </section>
    <section className="split-management alarms-layout">
      <article className="panel data-panel">
        <div className="data-toolbar">
          <label className="module-search grow"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索编号、名称、类型、位置或设备" /></label>
          <label className="compact-select"><ListFilter size={14} /><select value={level} onChange={(event) => setLevel(event.target.value as typeof level)}><option>全部</option><option>严重</option><option>一般</option><option>提示</option></select></label>
          <label className="compact-select"><Activity size={14} /><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option>全部</option><option>待确认</option><option>处理中</option><option>已关闭</option></select></label>
        </div>
        <div className="data-table alarm-table">
          <div className="table-head"><span>等级</span><span>告警信息</span><span>类型/来源</span><span>发生时间</span><span>状态</span></div>
          {filtered.length === 0 ? <EmptySearch /> : filtered.map((alarm) => <button key={alarm.id} className={selected?.id === alarm.id ? 'table-row active' : 'table-row'} onClick={() => setSelectedId(alarm.id)}>
            <span><StatusChip value={alarm.level} /></span>
            <span className="primary-cell"><strong>{alarm.title}</strong><small>{alarm.id} · {alarm.location}</small></span>
            <span className="primary-cell"><strong>{alarm.type}</strong><small>{alarm.source}</small></span>
            <span className="primary-cell"><strong>{alarm.time.slice(11)}</strong><small>{alarm.time.slice(0, 10)}</small></span>
            <span><StatusChip value={alarm.status} /></span>
          </button>)}
        </div>
        <div className="table-footer"><span>共 {filtered.length} 条告警</span><span>数据模式：模拟</span></div>
      </article>
      {selected && <AlarmDetail alarm={selected} onAcknowledge={() => acknowledgeAlarm(selected.id)} onDispatch={() => dispatchAlarm(selected.id)} onClose={() => closeAlarm(selected.id)} />}
    </section>
  </div>
}

function AlarmDetail({ alarm, onAcknowledge, onDispatch, onClose }: { alarm: AlarmRecord; onAcknowledge: () => void; onDispatch: () => void; onClose: () => void }) {
  return <aside className="panel detail-panel">
    <div className="detail-panel-head"><div><p className="panel-kicker">告警详情</p><h2>{alarm.title}</h2></div><StatusChip value={alarm.status} /></div>
    <div className="alert-banner"><CircleAlert size={20} /><div><strong>{alarm.id}</strong><span>{alarm.description}</span></div></div>
    <div className="detail-grid two">
      <DetailItem label="告警等级" value={alarm.level} /><DetailItem label="告警类型" value={alarm.type} /><DetailItem label="来源系统" value={alarm.source} /><DetailItem label="关联设备" value={alarm.device} /><DetailItem label="发生位置" value={alarm.location} /><DetailItem label="发生时间" value={alarm.time} />
    </div>
    <div className="media-placeholder"><div><ImageIcon size={20} /><span>关联图片</span><strong>2张模拟抓拍</strong></div><div><Camera size={20} /><span>关联视频</span><strong>网络故障</strong></div></div>
    <div className="detail-section-title"><span>处理动态</span><small>{alarm.timeline.length}条记录</small></div>
    <div className="event-timeline">{alarm.timeline.map((event, index) => <div key={`${event.time}-${index}`}><i className={index === alarm.timeline.length - 1 ? 'active' : ''} /><time>{event.time}</time><strong>{event.title}</strong><span>{event.detail}</span></div>)}</div>
    <div className="detail-section-title"><span>关联工单</span></div>
    {alarm.relatedWorkOrder ? <Link className="related-card" to="/workorders"><ClipboardCheck size={18} /><div><strong>{alarm.relatedWorkOrder}</strong><span>点击查看工单详情</span></div><ChevronRight size={16} /></Link> : <div className="no-related"><ClipboardCheck size={18} /><span>尚未关联工单</span></div>}
    <div className="detail-footer-actions"><button onClick={onAcknowledge} disabled={alarm.status !== '待确认'}><Check size={15} />确认告警</button><button onClick={onDispatch}><Send size={15} />转为工单</button><button className="primary" onClick={onClose} disabled={alarm.status === '已关闭'}><CircleCheck size={15} />关闭告警</button></div>
  </aside>
}

export function AccessPage() {
  const backend = useBackend()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'全部' | string>('全部')
  const [deviceType, setDeviceType] = useState<'全部' | string>('全部')
  const [selectedId, setSelectedId] = useState('')
  const [expandedZones, setExpandedZones] = useState<string[]>([])
  const [feedback, setFeedback] = useState('')
  const accessDevices = useMemo(() => backend.devices.filter((item) => item.category === '人员通行'), [backend.devices])
  const deviceTypes = useMemo(() => Array.from(new Set(accessDevices.map((item) => classifyAccessDevice(item)))), [accessDevices])
  const filteredDevices = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return accessDevices.filter((item) => {
      const currentType = classifyAccessDevice(item)
      const matchesQuery = !keyword || [item.id, item.name, item.location, item.ip, item.protocol].some((value) => value.toLowerCase().includes(keyword))
      const matchesStatus = status === '全部' || item.status === status
      const matchesType = deviceType === '全部' || currentType === deviceType
      return matchesQuery && matchesStatus && matchesType
    })
  }, [accessDevices, deviceType, query, status])
  const groupedDevices = useMemo(() => {
    const buckets = new Map<string, DeviceAsset[]>()
    filteredDevices.forEach((item) => {
      const zone = resolveAccessZone(item.location)
      const current = buckets.get(zone.id) ?? []
      current.push(item)
      buckets.set(zone.id, current)
    })
    return Array.from(buckets.entries()).map(([zoneId, items]) => ({
      zoneId,
      zoneName: accessZoneNames[zoneId] ?? zoneId,
      items,
    }))
  }, [filteredDevices])
  const selectedDevice = filteredDevices.find((item) => item.id === selectedId) ?? filteredDevices[0] ?? null
  const onlineCount = accessDevices.filter((item) => ['在线', '高负载', '预警'].includes(item.status)).length
  const alertCount = accessDevices.filter((item) => ['离线', '故障', '待配置'].includes(item.status)).length

  useEffect(() => {
    setExpandedZones((current) => current.length > 0 ? current : Array.from(new Set(accessDevices.map((item) => resolveAccessZone(item.location).id))))
  }, [accessDevices])

  useEffect(() => {
    if (!selectedDevice) return
    if (selectedId !== selectedDevice.id) setSelectedId(selectedDevice.id)
  }, [selectedDevice, selectedId])

  function toggleZone(zoneId: string) {
    setExpandedZones((current) => current.includes(zoneId) ? current.filter((item) => item !== zoneId) : [...current, zoneId])
  }

  function selectDevice(device: DeviceAsset) {
    setSelectedId(device.id)
    const zoneId = resolveAccessZone(device.location).id
    setExpandedZones((current) => current.includes(zoneId) ? current : [...current, zoneId])
  }

  return <div className="page operations-page">
    <PageTitle eyebrow="ACCESS & VISITOR MANAGEMENT" title="人员通行管理" description="按楼层区域管理门禁、闸机、客流等人员通行设备，统一查看状态与资产信息" action={<button className="outline-button" onClick={() => setFeedback('人员通行设备已从技术后台同步')}><RefreshCw size={15} />同步设备资产</button>} />
    <section className="metric-row four"><Metric label="人员通行设备" value={String(accessDevices.length)} note={`${filteredDevices.length} 台当前在列表中`} tone="cyan" icon={DoorOpen} /><Metric label="在线运行" value={String(onlineCount)} note="在线 / 预警 / 高负载" tone="green" icon={Users} /><Metric label="待处理设备" value={String(alertCount)} note="离线 / 故障 / 待配置" tone="orange" icon={UserCheck} /><Metric label="区域分组" value={String(groupedDevices.length)} note={`${deviceTypes.length} 类设备`} tone="purple" icon={Car} /></section>
    <section className="access-device-workspace">
      <aside className="access-device-tree panel">
        <div className="camera-tree-head">
          <div><p className="panel-kicker">设备目录</p><h2>人员通行设备</h2></div>
          <span className="access-tree-count">{filteredDevices.length} 台</span>
        </div>
        <label className="module-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索设备名称、编号、位置或IP" /></label>
        <div className="access-tree-filter-row">
          <label className="compact-select"><ListFilter size={14} /><select value={deviceType} onChange={(event) => setDeviceType(event.target.value)}><option value="全部">全部类型</option>{deviceTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className="compact-select"><Activity size={14} /><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="全部">全部状态</option>{Array.from(new Set(accessDevices.map((item) => item.status))).map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        </div>
        <div className="floor-tree">
          {groupedDevices.map((group) => {
            const expanded = expandedZones.includes(group.zoneId)
            const active = selectedDevice ? resolveAccessZone(selectedDevice.location).id === group.zoneId : false
            return <div className="floor-group" key={group.zoneId}>
              <button className={active ? 'floor-row active' : 'floor-row'} onClick={() => toggleZone(group.zoneId)}>
                <ChevronDown size={15} style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .16s ease' }} />
                <strong>{group.zoneName}</strong><span>{group.items.length} 台</span>
              </button>
              {expanded && <div className="camera-items">
                {group.items.map((device) => <button key={device.id} className={device.id === selectedDevice?.id ? 'camera-item active' : 'camera-item'} onClick={() => selectDevice(device)}>
                  <span className={`camera-status ${mapDeviceTone(device.status)}`}><DoorOpen size={14} /></span>
                  <span className="camera-label"><strong>{device.name}</strong><small>{device.id} · {classifyAccessDevice(device)}</small></span>
                  <i className={mapDeviceTone(device.status)} title={device.status} />
                </button>)}
              </div>}
            </div>
          })}
          {groupedDevices.length === 0 && <div className="catalog-empty"><Search size={22} /><strong>没有匹配的人员通行设备</strong><span>请调整搜索关键词或筛选条件</span></div>}
        </div>
      </aside>

      <div className="video-main">
        {selectedDevice && <article className="selected-camera-strip panel">
          <div className="selected-camera-identity">
            <span className={`camera-status ${mapDeviceTone(selectedDevice.status)}`}><DoorOpen size={15} /></span>
            <div><p className="panel-kicker">当前选中</p><h2>{selectedDevice.name}</h2></div>
            <span className={`device-state ${mapDeviceTone(selectedDevice.status)}`}><i />{selectedDevice.status}</span>
          </div>
          <div className="selected-camera-facts access-selected-facts">
            <span><small>设备编号</small><strong>{selectedDevice.id}</strong></span>
            <span><small>设备类型</small><strong>{classifyAccessDevice(selectedDevice)}</strong></span>
            <span><small>安装位置</small><strong>{selectedDevice.location}</strong></span>
            <span><small>通信地址</small><strong>{selectedDevice.ip}</strong></span>
          </div>
          <div className="video-summary compact" aria-label="人员通行设备统计">
            <span><i className="online" />在线 <strong>{onlineCount}</strong></span>
            <span><i className="fault" />待处理 <strong>{alertCount}</strong></span>
            <span><DoorOpen size={13} />总数 <strong>{accessDevices.length}</strong></span>
          </div>
          <div className="selected-camera-actions">
            <button title="定位设备" onClick={() => setFeedback(`已定位：${selectedDevice.location}`)}><MapPin size={15} /></button>
            <Link className="access-link-button" to="/backend" title="查看后台资产"><Info size={15} /></Link>
            <button title="刷新状态" onClick={() => setFeedback(`${selectedDevice.name} 状态已刷新`)}><RotateCcw size={15} /></button>
          </div>
        </article>}

        <article className="panel access-device-panel">
          <div className="player-toolbar">
            <div>
              <p className="panel-kicker">设备清单</p>
              <h2>按楼层区域展示的人员通行设备</h2>
            </div>
            <span className="catalog-hint">当前仅接入技术后台中的真实设备资产，不再展示原有演示通行记录</span>
          </div>
          <div className="access-device-grid">
            <div className="data-table access-device-table">
              <div className="table-head"><span>设备名称</span><span>类型/位置</span><span>网络与协议</span><span>最近心跳</span><span>状态</span></div>
              {filteredDevices.length === 0 ? <EmptySearch /> : filteredDevices.map((device) => <button key={device.id} className={selectedDevice?.id === device.id ? 'table-row active' : 'table-row'} onClick={() => selectDevice(device)}>
                <span className="primary-cell"><strong>{device.name}</strong><small>{device.id} · {device.vendor}</small></span>
                <span className="primary-cell"><strong>{classifyAccessDevice(device)}</strong><small>{device.location}</small></span>
                <span className="primary-cell"><strong>{device.ip}</strong><small>{device.protocol}</small></span>
                <span className="primary-cell"><strong>{device.lastSeen}</strong><small>{device.firmware}</small></span>
                <span><StatusChip value={device.status} /></span>
              </button>)}
            </div>
            {selectedDevice && <aside className="panel access-device-detail">
              <div className={`access-device-icon ${mapDeviceTone(selectedDevice.status)}`}><DoorOpen size={28} /></div>
              <h3>{selectedDevice.name}</h3>
              <StatusChip value={selectedDevice.status} />
              <div className="scan-line" />
              <DetailItem label="资产编号" value={selectedDevice.id} />
              <DetailItem label="设备类型" value={classifyAccessDevice(selectedDevice)} />
              <DetailItem label="安装位置" value={selectedDevice.location} />
              <DetailItem label="厂商 / 型号" value={`${selectedDevice.vendor} / ${selectedDevice.model}`} />
              <DetailItem label="通信地址" value={selectedDevice.ip} />
              <DetailItem label="接入协议" value={selectedDevice.protocol} />
              <DetailItem label="固件版本" value={selectedDevice.firmware} />
              <DetailItem label="最近心跳" value={selectedDevice.lastSeen} />
              <button className="outline-button" onClick={() => setFeedback(`${selectedDevice.name} 设备档案已展开`) }><ShieldCheck size={14} />查看设备档案</button>
            </aside>}
          </div>
        </article>
      </div>
    </section>
    {feedback && <LocalToast text={feedback} onClose={() => setFeedback('')} />}
  </div>
}

const accessZoneNames: Record<string, string> = {
  B1F: 'B1F',
  '1F': '1F',
  机房: '机房',
  其他区域: '其他区域',
}

function resolveAccessZone(location: string) {
  const normalized = location.toUpperCase()
  if (normalized.includes('B1F') || normalized.includes('B1')) return { id: 'B1F' }
  if (normalized.includes('1F')) return { id: '1F' }
  if (location.includes('机房')) return { id: '机房' }
  return { id: '其他区域' }
}

function classifyAccessDevice(device: DeviceAsset) {
  const signature = `${device.id} ${device.name}`.toLowerCase()
  if (signature.includes('客流') || device.id.startsWith('FC-')) return '客流设备'
  if (signature.includes('闸机')) return '闸机设备'
  if (signature.includes('门禁') || device.id.startsWith('AC-')) return '门禁设备'
  return '人员通行设备'
}

function mapDeviceTone(status: string) {
  if (['在线', '模拟运行', '已启用'].includes(status)) return 'online'
  if (['预警', '高负载', '故障'].includes(status)) return 'fault'
  return 'offline'
}

export function PublishingPage() {
  const [selectedId, setSelectedId] = useState(displayScreens[0].id)
  const [tasks, setTasks] = useState(publishingTasks)
  const [tab, setTab] = useState<'screens' | 'tasks' | 'materials'>('screens')
  const [feedback, setFeedback] = useState('')
  const selected = displayScreens.find((item) => item.id === selectedId) ?? displayScreens[0]
  function publishNow() {
    setTasks((items) => [{ id: `PUB2026082400${items.length + 22}`, name: '临时通知·模拟发布', screens: `${selected.name} 1屏`, schedule: '立即发布', creator: '当前管理员', status: selected.status === '在线' ? '播放中' : '部分失败' }, ...items])
    setFeedback(selected.status === '在线' ? `内容已模拟发布到${selected.name}` : `${selected.name}当前离线，任务已进入重试队列`)
  }
  return <div className="page operations-page">
    <PageTitle eyebrow="INFORMATION PUBLISHING" title="信息发布管理" description="统一管理发布屏、图片视频素材、节目单和发布任务" action={<button className="primary-button" onClick={publishNow}><CloudUpload size={16} />新建发布任务</button>} />
    <section className="metric-row four"><Metric label="发布屏" value="4" note="在线3 · 离线1" tone="cyan" icon={MonitorPlay} /><Metric label="正在播放" value="3" note="当前节目单" tone="green" icon={Play} /><Metric label="素材文件" value="28" note="图片18 · 视频10" tone="purple" icon={FileImage} /><Metric label="今日任务" value={String(tasks.length)} note="失败1项待重试" tone="orange" icon={CalendarClock} /></section>
    <section className="panel tabbed-panel"><div className="module-tabs"><button className={tab === 'screens' ? 'active' : ''} onClick={() => setTab('screens')}>屏幕设备</button><button className={tab === 'tasks' ? 'active' : ''} onClick={() => setTab('tasks')}>发布任务</button><button className={tab === 'materials' ? 'active' : ''} onClick={() => setTab('materials')}>素材库</button></div>
      {tab === 'screens' && <div className="publishing-layout"><div className="screen-list">{displayScreens.map((screen) => <button key={screen.id} className={selected.id === screen.id ? 'active' : ''} onClick={() => setSelectedId(screen.id)}><span className="screen-icon"><MonitorPlay size={20} /></span><div><strong>{screen.name}</strong><small>{screen.id} · {screen.location}</small></div><StatusChip value={screen.status} /></button>)}</div><article className="virtual-display"><div className="virtual-screen"><div className="museum-slide"><p>SPORTS MUSEUM</p><h2>今日参观导览</h2><span>探索体育文明 · 感受冠军精神</span><div className="slide-track"><i /></div></div>{selected.status === '离线' && <div className="screen-offline"><CircleAlert size={28} /><strong>设备离线</strong><span>最后同步 {selected.lastSync}</span></div>}</div><div className="virtual-meta"><div><span>当前屏幕</span><strong>{selected.name}</strong></div><div><span>分辨率</span><strong>{selected.resolution}</strong></div><div><span>当前内容</span><strong>{selected.current}</strong></div><div><span>设备分组</span><strong>{selected.group}</strong></div></div><div className="display-actions"><button onClick={() => setFeedback('节目单编辑器已打开')}><Layers3 size={14} />编辑节目单</button><button onClick={() => setFeedback('虚拟屏幕预览已刷新')}><RefreshCw size={14} />刷新预览</button><button className="primary" onClick={publishNow}><Send size={14} />立即发布</button></div></article></div>}
      {tab === 'tasks' && <div className="data-table publish-table"><div className="table-head"><span>任务编号</span><span>任务名称</span><span>目标屏幕</span><span>发布时间</span><span>创建人</span><span>状态</span><span>操作</span></div>{tasks.map((task) => <div className="table-row" key={task.id}><span>{task.id}</span><span>{task.name}</span><span>{task.screens}</span><span>{task.schedule}</span><span>{task.creator}</span><span><StatusChip value={task.status} /></span><span className="row-actions"><button onClick={() => { setTasks((items) => items.map((item) => item.id === task.id ? { ...item, status: '播放中' } : item)); setFeedback('发布任务已重新执行') }}><RefreshCw size={13} />{task.status === '部分失败' ? '重试' : '详情'}</button></span></div>)}</div>}
      {tab === 'materials' && <div className="material-grid">{['开馆导览主视觉.jpg', '体育冠军专题.mp4', '互动项目提示.png', '闭馆安全提示.mp4', '城市体育记忆.jpg', '观众须知.png'].map((name, index) => <article key={name}><div className={`material-thumb m${index + 1}`}>{index % 2 ? <Play size={24} /> : <ImageIcon size={24} />}</div><strong>{name}</strong><span>{index % 2 ? '视频 · 00:32' : '图片 · 3840×2160'}</span><button onClick={() => setFeedback(`${name}已选入节目单`)}><Plus size={13} />加入节目单</button></article>)}</div>}
    </section>{feedback && <LocalToast text={feedback} onClose={() => setFeedback('')} />}
  </div>
}

export function WorkOrdersPage() {
  const { workOrders, advanceWorkOrder } = useDemo()
  const [selectedId, setSelectedId] = useState(workOrders[0]?.id ?? '')
  const [status, setStatus] = useState('全部')
  const [query, setQuery] = useState('')
  const selected = workOrders.find((item) => item.id === selectedId) ?? workOrders[0]
  const filtered = workOrders.filter((item) => (status === '全部' || item.status === status) && (!query || [item.id, item.title, item.type, item.location, item.assignee].some((value) => value.includes(query))))
  return <div className="page operations-page">
    <PageTitle eyebrow="WORK ORDER MANAGEMENT" title="工单管理" description="覆盖维护、更换、申购、巡检和事件处置的完整流转" action={<button className="primary-button"><Plus size={16} />发起工单</button>} />
    <section className="metric-row five"><Metric label="全部工单" value={String(workOrders.length)} note="今日新增3" tone="cyan" icon={ClipboardCheck} /><Metric label="待分配" value={String(workOrders.filter((item) => item.status === '待分配').length)} note="需要部门接单" tone="red" icon={AlarmClock} /><Metric label="处理中" value={String(workOrders.filter((item) => item.status === '处理中').length)} note="现场处理中" tone="orange" icon={Wrench} /><Metric label="待验收" value={String(workOrders.filter((item) => item.status === '待验收').length)} note="等待发起方确认" tone="purple" icon={BadgeCheck} /><Metric label="完成率" value="92%" note="本月平均" tone="green" icon={CheckCircle2} /></section>
    <section className="split-management workorders-layout"><article className="panel data-panel"><div className="data-toolbar"><label className="module-search grow"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索工单、位置或处理人" /></label><label className="compact-select"><Activity size={14} /><select value={status} onChange={(event) => setStatus(event.target.value)}><option>全部</option><option>待分配</option><option>处理中</option><option>待验收</option><option>已完成</option></select></label></div><div className="data-table workorder-table"><div className="table-head"><span>工单</span><span>类型</span><span>部门/处理人</span><span>时限</span><span>进度</span><span>状态</span></div>{filtered.map((item) => <button className={selected.id === item.id ? 'table-row active' : 'table-row'} key={item.id} onClick={() => setSelectedId(item.id)}><span className="primary-cell"><strong>{item.title}</strong><small>{item.id} · {item.location}</small></span><span><StatusChip value={item.type} /></span><span className="primary-cell"><strong>{item.department}</strong><small>{item.assignee}</small></span><span className="primary-cell"><strong>{item.dueAt.slice(11)}</strong><small>{item.dueAt.slice(0,10)}</small></span><span><i className="progress-bar"><b style={{ width: `${item.progress}%` }} /></i><small>{item.progress}%</small></span><span><StatusChip value={item.status} /></span></button>)}</div></article>{selected && <WorkOrderDetail item={selected} onAdvance={() => advanceWorkOrder(selected.id)} />}</section>
  </div>
}

function WorkOrderDetail({ item, onAdvance }: { item: WorkOrderRecord; onAdvance: () => void }) {
  const next = { '待分配': '接单并开始处理', '处理中': '提交处理结果', '待验收': '验收并完成', '已完成': '已完成' }[item.status]
  return <aside className="panel detail-panel"><div className="detail-panel-head"><div><p className="panel-kicker">工单详情</p><h2>{item.title}</h2></div><StatusChip value={item.status} /></div><div className="workorder-code"><ClipboardCheck size={28} /><div><strong>{item.id}</strong><span>{item.source}</span></div><StatusChip value={item.priority} /></div><div className="detail-grid two"><DetailItem label="工单类型" value={item.type} /><DetailItem label="负责部门" value={item.department} /><DetailItem label="处理人员" value={item.assignee} /><DetailItem label="处理位置" value={item.location} /><DetailItem label="发起时间" value={item.createdAt} /><DetailItem label="完成时限" value={item.dueAt} /></div><div className="detail-section-title"><span>处理进度</span><strong>{item.progress}%</strong></div><div className="large-progress"><i style={{ width: `${item.progress}%` }} /></div><div className="step-flow">{['发起', '分配', '处理', '验收', '完成'].map((step, index) => <div className={index <= Math.round(item.progress / 25) ? 'done' : ''} key={step}><i>{index < Math.round(item.progress / 25) ? <Check size={11} /> : index + 1}</i><span>{step}</span></div>)}</div><div className="detail-section-title"><span>附件与反馈</span></div><div className="attachment-row"><span><ImageIcon size={16} />现场照片_01.jpg</span><span><FileImage size={16} />处理记录.pdf</span></div><div className="detail-footer-actions"><button><Send size={15} />转派</button><button><RotateCcw size={15} />退回</button><button className="primary" onClick={onAdvance} disabled={item.status === '已完成'}><CheckCircle2 size={15} />{next}</button></div></aside>
}

export function MapPage() {
  const [floor, setFloor] = useState<'F1' | 'F2'>('F1')
  const [type, setType] = useState('全部')
  const [status, setStatus] = useState('全部')
  const [query, setQuery] = useState('')
  const visibleNodes = mapNodes.filter((node) => node.floor === floor && (type === '全部' || node.type === type) && (status === '全部' || node.status === status) && (!query || [node.id, node.name, node.type].some((value) => value.toLowerCase().includes(query.toLowerCase()))))
  const [selectedId, setSelectedId] = useState(mapNodes[0].id)
  const selected = visibleNodes.find((node) => node.id === selectedId) ?? visibleNodes[0]
  const detailPath = selected?.type === '摄像头' ? '/video' : selected?.type === '门禁' ? '/access' : selected?.type === '发布屏' ? '/publishing' : '/network'
  function changeFloor(nextFloor: 'F1' | 'F2') {
    setFloor(nextFloor)
    setSelectedId(mapNodes.find((node) => node.floor === nextFloor)?.id ?? '')
  }
  return <div className="page operations-page map-page"><PageTitle eyebrow="GIS & DEVICE MAP" title="电子地图管理" description="展示场馆平面地图、设备节点、运行状态和事件定位" action={<div className="floor-switch"><button className={floor === 'F1' ? 'active' : ''} onClick={() => changeFloor('F1')}>一层</button><button className={floor === 'F2' ? 'active' : ''} onClick={() => changeFloor('F2')}>二层</button></div>} />
    <section className="map-workspace panel"><div className="map-toolbar"><label className="module-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索名称、编号或类型" /></label><div className="map-types">{['全部', '摄像头', '门禁', '发布屏', '无线AP'].map((item) => <button className={type === item ? 'active' : ''} onClick={() => setType(item)} key={item}>{item}</button>)}</div><label className="compact-select"><Activity size={14}/><select value={status} onChange={(event) => setStatus(event.target.value)}><option>全部</option><option>正常</option><option>告警</option></select></label><span>显示 {visibleNodes.length} 个节点</span></div><div className="map-stage"><div className="floor-plan"><div className="fp-zone lobby">序厅</div><div className="fp-zone origin">体育起源展区</div><div className="fp-zone history">体育发展展区</div><div className="fp-zone interactive">互动体验区</div><div className="fp-zone temporary">临时展区</div><div className="fp-corridor">公共走廊</div>{visibleNodes.map((node) => <button key={node.id} className={`device-node ${node.status === '告警' ? 'alarm' : ''} t-${node.type}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => setSelectedId(node.id)} title={`${node.name} · ${node.status}`}>{node.type === '摄像头' ? <Camera size={15} /> : node.type === '门禁' ? <DoorOpen size={15} /> : node.type === '发布屏' ? <MonitorPlay size={15} /> : <Wifi size={15} />}</button>)}</div><aside className="map-detail"><p className="panel-kicker">设备节点详情</p>{selected ? <><div className="map-device-icon"><MapPin size={25} /></div><h2>{selected.name}</h2><StatusChip value={selected.status} /><DetailItem label="设备编号" value={selected.id} /><DetailItem label="设备类型" value={selected.type} /><DetailItem label="所在楼层" value={selected.floor === 'F1' ? '一层' : '二层'} /><DetailItem label="相对坐标" value={`${selected.x}% , ${selected.y}%`} /><div className="map-detail-actions"><Link to={detailPath}>查看{selected.type}</Link><Link to="/alarms">关联告警</Link></div></> : <EmptySearch />}</aside></div></section>
  </div>
}

const environmentTrend = [{ time: '08:00', temp: 23.5, humidity: 47 }, { time: '09:00', temp: 24.2, humidity: 49 }, { time: '10:00', temp: 26.8, humidity: 51 }, { time: '10:30', temp: 28.1, humidity: 52 }, { time: '10:45', temp: 28.6, humidity: 52 }]

export function EnvironmentPage() {
  const [room, setRoom] = useState('第一机房')
  const [selectedSensor, setSelectedSensor] = useState(sensors[0])
  const roomSensors = sensors.filter((item) => item.room === room)
  const [feedback, setFeedback] = useState('')
  return <div className="page operations-page"><PageTitle eyebrow="ENVIRONMENT & UPS" title="机房环境监测及控制" description="监测温湿度、漏水、烟雾、监控和UPS运行状态" action={<div className="live-indicator"><i />10秒自动刷新</div>} /><section className="metric-row four"><Metric label="机房数量" value="2" note="核心机房 · 第一机房" tone="cyan" icon={ServerCog} /><Metric label="传感器" value="6" note="在线率100%" tone="green" icon={Gauge} /><Metric label="当前预警" value="1" note="第一机房温度" tone="orange" icon={ThermometerSun} /><Metric label="UPS设备" value="2" note="供电状态正常" tone="purple" icon={BatteryCharging} /></section>
    <section className="environment-layout"><article className="panel sensor-panel"><div className="module-tabs"><button className={room === '第一机房' ? 'active' : ''} onClick={() => setRoom('第一机房')}>第一机房</button><button className={room === '核心机房' ? 'active' : ''} onClick={() => setRoom('核心机房')}>核心机房</button></div><div className="sensor-grid">{roomSensors.map((sensor) => <button className={selectedSensor.id === sensor.id ? 'sensor-card active' : 'sensor-card'} onClick={() => setSelectedSensor(sensor)} key={sensor.id}><span className={`sensor-icon ${sensor.status === '预警' ? 'warning' : ''}`}>{sensor.type === '温湿度' ? <ThermometerSun size={23} /> : sensor.type === '漏水' ? <Zap size={23} /> : <SmokeDetector size={23} />}</span><div><small>{sensor.type}</small><strong>{sensor.value}</strong><span>{sensor.name}</span></div><StatusChip value={sensor.status} /></button>)}</div><div className="environment-chart"><div className="panel-head"><div><p className="panel-kicker">历史趋势</p><h2>{selectedSensor.name}</h2></div><span>{selectedSensor.update} 更新</span></div><ResponsiveContainer width="100%" height={220}><LineChart data={environmentTrend}><CartesianGrid stroke="#20344e" strokeDasharray="3 6" vertical={false} /><XAxis dataKey="time" stroke="#60758b" fontSize={9} tickLine={false} axisLine={false} /><YAxis stroke="#60758b" fontSize={9} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ background: '#0d1e33', border: '1px solid #263d5a', borderRadius: 8 }} /><Line type="monotone" dataKey="temp" stroke="#ff9c5b" strokeWidth={2.4} dot={{ fill: '#ff9c5b', r: 3 }} /><Line type="monotone" dataKey="humidity" stroke="#45c5ff" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer><div className="threshold-note"><CircleAlert size={15} /><span>温度预警阈值28℃，严重告警阈值32℃；当前值28.6℃</span><button onClick={() => setFeedback('阈值配置面板已模拟打开')}>调整阈值</button></div></div></article><aside className="ups-column">{upsDevices.map((ups) => <article className="panel ups-card" key={ups.id}><div className="ups-head"><span><BatteryCharging size={22} /></span><div><small>{ups.id}</small><h3>{ups.name}</h3></div><StatusChip value={ups.status} /></div><div className="ups-supply"><Zap size={16} /><div><span>供电状态</span><strong>{ups.supply}</strong></div></div><div className="ups-meter"><div><span>负载率</span><strong>{ups.load}%</strong></div><i><b style={{ width: `${ups.load}%` }} /></i></div><div className="detail-grid two"><DetailItem label="备电时间" value={ups.backup} /><DetailItem label="输出有功功率" value={ups.power} /><DetailItem label="电池状态" value={ups.battery} /><DetailItem label="设备位置" value={ups.room} /></div><button className="outline-button" onClick={() => setFeedback(`${ups.name}运行详情已刷新`)}><RefreshCw size={14} />刷新运行数据</button></article>)}</aside></section>{feedback && <LocalToast text={feedback} onClose={() => setFeedback('')} />}
  </div>
}

export function AudioPage() {
  const [zones, setZones] = useState(audioZones)
  const [selectedId, setSelectedId] = useState(zones[0].id)
  const selected = zones.find((item) => item.id === selectedId) ?? zones[0]
  const [feedback, setFeedback] = useState('')
  function updateSelected(patch: Partial<(typeof zones)[number]>) { setZones((items) => items.map((item) => item.id === selected.id ? { ...item, ...patch } : item)) }
  return <div className="page operations-page"><PageTitle eyebrow="BACKGROUND MUSIC" title="背景音乐管理" description="管理广播分区、播放内容、音量和定时任务，预留厂家SDK接口" action={<button className="primary-button" onClick={() => setFeedback('新的定时播放任务已进入编辑状态')}><Plus size={16} />新建播放任务</button>} /><section className="metric-row four"><Metric label="广播分区" value="4" note="全部已接入模拟适配器" tone="cyan" icon={Music2} /><Metric label="播放设备" value="54" note="在线54" tone="green" icon={Volume2} /><Metric label="正在播放" value="3" note="1个分区暂停" tone="purple" icon={Play} /><Metric label="今日任务" value="8" note="下次11:30" tone="orange" icon={CalendarClock} /></section><section className="audio-layout"><article className="panel zone-list"><div className="panel-head"><div><p className="panel-kicker">广播分区</p><h2>分区运行状态</h2></div><Antenna size={18} /></div>{zones.map((zone) => <button className={selected.id === zone.id ? 'active' : ''} onClick={() => setSelectedId(zone.id)} key={zone.id}><span className="zone-wave"><Music2 size={18} /></span><div><strong>{zone.name}</strong><small>{zone.id} · {zone.devices}台设备</small></div><StatusChip value={zone.status} /></button>)}</article><article className="panel audio-console"><div className="now-playing"><div className="album-art"><Music2 size={36} /></div><div><p>当前播放</p><h2>{selected.current}</h2><span>{selected.name} · 音量 {selected.volume}%</span></div><StatusChip value={selected.status} /></div><div className="audio-waveform">{Array.from({ length: 42 }).map((_, index) => <i key={index} style={{ height: `${10 + ((index * 17) % 42)}px` }} />)}</div><div className="audio-controls"><button onClick={() => setFeedback('已切换到上一节目')}><SkipBack size={18} /></button><button className="main" onClick={() => updateSelected({ status: selected.status === '播放中' ? '已暂停' : '播放中' })}>{selected.status === '播放中' ? <Pause size={21} /> : <Play size={21} />}</button><button onClick={() => setFeedback('已切换到下一节目')}><SkipForward size={18} /></button></div><label className="volume-slider"><Volume2 size={17} /><input type="range" min="0" max="100" value={selected.volume} onChange={(event) => updateSelected({ volume: Number(event.target.value) })} /><strong>{selected.volume}%</strong></label><div className="audio-info"><DetailItem label="分区设备" value={`${selected.devices}台 · 全部在线`} /><DetailItem label="下一任务" value={selected.next} /><DetailItem label="接口模式" value="MockAudioAdapter" /><DetailItem label="控制方式" value="SDK接口预留" /></div></article><aside className="panel schedule-panel"><div className="panel-head"><div><p className="panel-kicker">今日计划</p><h2>定时播放任务</h2></div><CalendarClock size={18} /></div>{[['08:50','开馆迎宾','已执行'],['11:30','整点参观提示','待执行'],['12:00','午间文明参观提示','待执行'],['16:45','闭馆安全提示','待执行']].map((task) => <div className="schedule-row" key={task[0]}><time>{task[0]}</time><div><strong>{task[1]}</strong><span>全馆公共展区</span></div><StatusChip value={task[2]} /></div>)}</aside></section>{feedback && <LocalToast text={feedback} onClose={() => setFeedback('')} />}</div>
}

const networkTrend = [{ time: '08:00', traffic: 120, clients: 68 }, { time: '09:00', traffic: 286, clients: 156 }, { time: '10:00', traffic: 438, clients: 284 }, { time: '11:00', traffic: 512, clients: 326 }, { time: '12:00', traffic: 382, clients: 248 }]

export function NetworkPage() {
  const [selectedId, setSelectedId] = useState(accessPoints[0].id)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'全部' | (typeof accessPoints)[number]['status']>('全部')
  const [feedback, setFeedback] = useState('')
  const filteredAccessPoints = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return accessPoints.filter((item) => {
      const matchesQuery = !keyword || [item.id, item.name, item.location].some((value) => value.toLowerCase().includes(keyword))
      const matchesStatus = status === '全部' || item.status === status
      return matchesQuery && matchesStatus
    })
  }, [query, status])
  const selected = filteredAccessPoints.find((item) => item.id === selectedId) ?? filteredAccessPoints[0] ?? accessPoints[0]

  useEffect(() => {
    if (filteredAccessPoints.length === 0) return
    if (!filteredAccessPoints.some((item) => item.id === selectedId)) {
      setSelectedId(filteredAccessPoints[0].id)
    }
  }, [filteredAccessPoints, selectedId])

  return <div className="page operations-page"><PageTitle eyebrow="WIRELESS NETWORK" title="无线网络管理" description="监测无线AP、接入终端、流量、负载和网络告警" action={<button className="outline-button" onClick={() => setFeedback('网管协议数据已模拟同步')}><RefreshCw size={15} />同步网管数据</button>} /><section className="metric-row five"><Metric label="无线AP" value="62" note="在线61 · 异常1" tone="cyan" icon={RadioTower} /><Metric label="接入终端" value="326" note="访客终端284" tone="green" icon={Smartphone} /><Metric label="实时流量" value="512Mbps" note="出口利用率42%" tone="purple" icon={Activity} /><Metric label="高负载AP" value="1" note="互动体验区" tone="orange" icon={Gauge} /><Metric label="网络健康度" value="98.4%" note="整体运行稳定" tone="green" icon={Wifi} /></section><section className="network-layout"><article className="panel network-chart"><div className="panel-head"><div><p className="panel-kicker">网络趋势</p><h2>终端与出口流量</h2></div><span className="live-indicator"><i />实时</span></div><ResponsiveContainer width="100%" height={240}><AreaChart data={networkTrend}><defs><linearGradient id="networkFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#45c5ff" stopOpacity={.35}/><stop offset="100%" stopColor="#45c5ff" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#20344e" strokeDasharray="3 6" vertical={false}/><XAxis dataKey="time" stroke="#60758b" fontSize={9} axisLine={false}/><YAxis stroke="#60758b" fontSize={9} axisLine={false}/><Tooltip contentStyle={{ background: '#0d1e33', border: '1px solid #263d5a', borderRadius: 8 }}/><Area type="monotone" dataKey="traffic" stroke="#45c5ff" fill="url(#networkFill)" strokeWidth={2.5}/><Line type="monotone" dataKey="clients" stroke="#4be1bd" strokeWidth={2}/></AreaChart></ResponsiveContainer></article><aside className="panel ap-detail"><div className="ap-signal"><Wifi size={30} /><i /><i /><i /></div><h2>{selected.name}</h2><StatusChip value={selected.status} /><DetailItem label="设备编号" value={selected.id} /><DetailItem label="安装位置" value={selected.location} /><DetailItem label="接入终端" value={`${selected.clients}台`} /><DetailItem label="实时流量" value={selected.traffic} /><DetailItem label="无线信道" value={selected.channel} /><DetailItem label="持续运行" value={selected.uptime} /><button className="outline-button" onClick={() => setFeedback(`${selected.name}已模拟重启`)}><RotateCcw size={14} />模拟重启AP</button></aside></section><section className="panel data-panel"><div className="data-toolbar"><label className="module-search grow"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索AP名称、编号或位置" /></label><label className="compact-select"><ListFilter size={14}/><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="全部">全部状态</option><option value="在线">在线</option><option value="高负载">高负载</option><option value="离线">离线</option></select></label></div><div className="data-table ap-table"><div className="table-head"><span>AP设备</span><span>安装位置</span><span>终端数</span><span>实时流量</span><span>信道</span><span>运行时长</span><span>状态</span></div>{filteredAccessPoints.length === 0 ? <EmptySearch /> : filteredAccessPoints.map((ap) => <button className={selected.id === ap.id ? 'table-row active' : 'table-row'} onClick={() => setSelectedId(ap.id)} key={ap.id}><span className="primary-cell"><strong>{ap.name}</strong><small>{ap.id}</small></span><span>{ap.location}</span><span>{ap.clients}台</span><span>{ap.traffic}</span><span>CH {ap.channel}</span><span>{ap.uptime}</span><span><StatusChip value={ap.status}/></span></button>)}</div></section>{feedback && <LocalToast text={feedback} onClose={() => setFeedback('')}/>}</div>
}

export function InterfacesPage() {
  const [selectedId, setSelectedId] = useState(systemInterfaces[0].id)
  const [feedback, setFeedback] = useState('')
  const selected = systemInterfaces.find((item) => item.id === selectedId) ?? systemInterfaces[0]
  return <div className="page operations-page"><PageTitle eyebrow="SYSTEM INTEGRATION" title="接口管理" description="统一管理视频、门禁、发布、音乐、无线、动环与UPS系统适配器" action={<span className="mock-interface-badge"><Cpu size={15}/>当前全部运行于模拟适配器</span>} /><section className="interface-grid">{systemInterfaces.map((item) => <button className={selected.id === item.id ? 'interface-card panel active' : 'interface-card panel'} onClick={() => setSelectedId(item.id)} key={item.id}><div className="interface-icon">{item.id === 'IF-VIDEO' ? <Camera size={22}/> : item.id === 'IF-ACCESS' ? <DoorOpen size={22}/> : item.id === 'IF-PUBLISH' ? <MonitorPlay size={22}/> : item.id === 'IF-AUDIO' ? <Music2 size={22}/> : item.id === 'IF-WLAN' ? <Wifi size={22}/> : item.id === 'IF-UPS' ? <BatteryCharging size={22}/> : <Gauge size={22}/>}</div><div><h3>{item.name}</h3><span>{item.method}</span></div><StatusChip value={item.status}/><dl><div><dt>适配器</dt><dd>{item.adapter}</dd></div><div><dt>模拟设备</dt><dd>{item.devices}</dd></div><div><dt>同步周期</dt><dd>{item.sync}</dd></div></dl></button>)}</section><section className="panel interface-detail"><div className="detail-panel-head"><div><p className="panel-kicker">接口配置详情</p><h2>{selected.name}</h2></div><StatusChip value={selected.status}/></div><div className="interface-flow"><div><ServerCog size={22}/><strong>业务页面</strong><span>标准数据模型</span></div><ChevronRight/><div className="active"><Cpu size={22}/><strong>{selected.adapter}</strong><span>当前启用</span></div><ChevronRight/><div><Network size={22}/><strong>{selected.method}</strong><span>第二阶段启用</span></div><ChevronRight/><div><HardDrive size={22}/><strong>现场系统</strong><span>{selected.vendor}</span></div></div><div className="interface-config-grid"><DetailItem label="接口编号" value={selected.id}/><DetailItem label="厂家信息" value={selected.vendor}/><DetailItem label="预留接入方式" value={selected.method}/><DetailItem label="当前适配器" value={selected.adapter}/><DetailItem label="模拟设备范围" value={selected.devices}/><DetailItem label="数据同步周期" value={selected.sync}/></div><div className="capability-list"><h3>预留能力</h3>{['获取设备列表与设备状态','接收设备告警与运行数据','查询历史记录和业务数据','执行授权范围内的设备控制','记录接口调用和操作日志'].map((item) => <span key={item}><CheckCircle2 size={14}/>{item}</span>)}</div><div className="detail-footer-actions"><button onClick={() => setFeedback('接口参数编辑面板已模拟打开')}><ServerCog size={15}/>编辑配置</button><button onClick={() => setFeedback(`${selected.adapter}模拟连接测试通过`)}><Activity size={15}/>测试连接</button><button className="primary" onClick={() => setFeedback('接口配置已保存')}><Check size={15}/>保存配置</button></div></section>{feedback && <LocalToast text={feedback} onClose={() => setFeedback('')}/>}</div>
}

export function DemoConsolePage() {
  const { triggerScenario, resetDemo, alarms, workOrders } = useDemo()
  const [activeId, setActiveId] = useState('camera-offline')
  const [running, setRunning] = useState(false)
  const active = demoScenarios.find((item) => item.id === activeId) ?? demoScenarios[0]
  const steps = active.id === 'camera-offline' ? ['选择体育发展展区摄像头', '模拟设备网络中断', '产生严重设备告警', '进入告警详情并确认', '转为维修工单', '完成处置并关闭告警'] : active.id === 'visitor-entry' ? ['填写访客预约信息', '被访人审批通过', '生成一次性二维码', '南门门禁核验', '记录访客入场'] : ['加载场景初始状态', '模拟关键指标变化', '触发平台事件', '执行管理操作', '记录操作结果']
  function start() { setRunning(true); triggerScenario(active.id); window.setTimeout(() => setRunning(false), 1800) }
  return <div className="page operations-page"><PageTitle eyebrow="DEMO SCENARIO CONTROL" title="演示控制台" description="稳定触发、观察和重置各类模拟演示场景" action={<button className="danger-outline-button" onClick={resetDemo}><RotateCcw size={15}/>重置全部演示数据</button>} /><section className="demo-status-strip"><span><i className="green"/>模拟服务正常</span><span>告警数据 {alarms.length} 条</span><span>工单数据 {workOrders.length} 条</span><span>设备模拟器 7 个</span><span>运行模式 MOCK</span></section><section className="scenario-layout"><div className="scenario-grid">{demoScenarios.map((scenario) => <button className={active.id === scenario.id ? `scenario-card panel active ${scenario.tone}` : `scenario-card panel ${scenario.tone}`} onClick={() => setActiveId(scenario.id)} key={scenario.id}><span className="scenario-icon">{scenario.id === 'camera-offline' ? <Camera size={21}/> : scenario.id === 'temperature-high' ? <ThermometerSun size={21}/> : scenario.id === 'visitor-entry' ? <QrCode size={21}/> : scenario.id === 'screen-publish' ? <MonitorPlay size={21}/> : <BatteryCharging size={21}/>}</span><div><h3>{scenario.title}</h3><p>{scenario.description}</p></div><span>{scenario.module}</span><small>{scenario.duration}</small></button>)}</div><aside className="panel scenario-runner"><p className="panel-kicker">当前场景</p><h2>{active.title}</h2><p>{active.description}</p><div className="scenario-steps">{steps.map((step,index) => <div key={step}><i>{index+1}</i><span>{step}</span></div>)}</div><button className={running ? 'primary-button running' : 'primary-button'} onClick={start} disabled={running}>{running ? <><RefreshCw className="spinning" size={16}/>正在启动场景</> : <><Play size={16}/>启动演示场景</>}</button><small>启动后相关模块数据会根据预设步骤发生变化，所有操作可重置。</small></aside></section><section className="panel demo-guide"><div><Info size={20}/><div><h3>推荐演示顺序</h3><p>综合态势 → 演示控制台触发场景 → 告警中心 → 视频或动环 → 工单管理 → 关闭事件</p></div></div><Link to="/alarms">前往告警中心 <ChevronRight size={14}/></Link></section></div>
}

function Metric({ label, value, note, tone, icon: Icon }: { label: string; value: string; note: string; tone: string; icon: ComponentType<{ size?: number }> }) {
  return <article className={`metric-card ${tone}`}><span className="metric-icon"><Icon size={18} /></span><div><p>{label}</p><strong>{value}</strong><span>{note}</span></div></article>
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return <div className="detail-item"><span>{label}</span><strong>{value}</strong></div>
}

function LocalToast({ text, onClose }: { text: string; onClose: () => void }) {
  return <div className="demo-toast"><CircleCheck size={15}/><span>{text}</span><button onClick={onClose}><X size={13}/></button></div>
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal-card" onMouseDown={(event) => event.stopPropagation()}><div className="modal-head"><h2>{title}</h2><button onClick={onClose}><X size={17}/></button></div>{children}</div></div>
}
