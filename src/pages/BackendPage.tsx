import { Activity, Boxes, Cable, Check, ChevronRight, CircleAlert, CircleCheck, ClipboardList, CloudCog, Code2, Cpu, Database, FileCode2, Filter, Gauge, KeyRound, Layers3, Link2, ListRestart, MonitorCog, Network, Pencil, Plus, Search, Settings2, ShieldCheck, SlidersHorizontal, Trash2, Unplug, X, Zap } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { useBackend, type DeviceAsset, type ExternalApplication, type FrontendChannel, type HardwareGateway } from '../context/BackendContext'
import { stageLightingControlLoops, stageLightingPages, stageLightingPowerLoops, type StageLightingPage } from '../data/stageLighting'
import { vlanAllocations, vlanSegments, type VlanSegment } from '../data/vlanPlan'

type BackendTab = 'overview' | 'devices' | 'vlan' | 'lighting' | 'hardware' | 'applications' | 'channels' | 'api' | 'logs'

const tabs: { id: BackendTab; label: string; icon: typeof Boxes }[] = [
  { id: 'overview', label: '后台总览', icon: Gauge },
  { id: 'devices', label: '设备资产', icon: Boxes },
  { id: 'vlan', label: 'VLAN规划', icon: Network },
  { id: 'lighting', label: '舞台灯光配置', icon: Zap },
  { id: 'hardware', label: '硬件与协议', icon: Cable },
  { id: 'applications', label: '外部系统接入', icon: CloudCog },
  { id: 'channels', label: '展示端配置', icon: MonitorCog },
  { id: 'api', label: '开放API', icon: Code2 },
  { id: 'logs', label: '操作日志', icon: ClipboardList },
]

const blankDevice: DeviceAsset = { id: '', name: '', category: '视频监控', vendor: '待确认', model: '', location: '', ip: '', protocol: '待配置', status: '待配置', firmware: '待确认', lastSeen: '尚未接入' }
const blankApplication: ExternalApplication = { id: '', name: '', type: '前端展示系统', owner: '信息技术部', baseUrl: '', callback: '', authMode: 'OAuth 2.0', scopes: [], status: '待配置', lastSync: '尚未同步' }

export function BackendPage() {
  const backend = useBackend()
  const [tab, setTab] = useState<BackendTab>('overview')
  const [query, setQuery] = useState('')
  const [deviceCategory, setDeviceCategory] = useState('全部')
  const [vlanBusinessType, setVlanBusinessType] = useState('全部')
  const [selectedDeviceId, setSelectedDeviceId] = useState(backend.devices[0]?.id ?? '')
  const [selectedVlanId, setSelectedVlanId] = useState(vlanSegments[0]?.id ?? '')
  const [selectedLightingPageId, setSelectedLightingPageId] = useState(stageLightingPages[0]?.id ?? '')
  const [selectedGatewayId, setSelectedGatewayId] = useState(backend.gateways[0]?.id ?? '')
  const [selectedAppId, setSelectedAppId] = useState(backend.applications[0]?.id ?? '')
  const [deviceDraft, setDeviceDraft] = useState<DeviceAsset | null>(null)
  const [gatewayDraft, setGatewayDraft] = useState<HardwareGateway | null>(null)
  const [appDraft, setAppDraft] = useState<ExternalApplication | null>(null)
  const [channelDraft, setChannelDraft] = useState<FrontendChannel | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ kind: 'device' | 'application'; id: string; name: string } | null>(null)
  const [feedback, setFeedback] = useState('')

  const filteredDevices = useMemo(() => backend.devices.filter((item) => (deviceCategory === '全部' || item.category === deviceCategory) && (!query || Object.values(item).some((value) => String(value).toLowerCase().includes(query.toLowerCase())))), [backend.devices, deviceCategory, query])
  const selectedDevice = backend.devices.find((item) => item.id === selectedDeviceId) ?? filteredDevices[0]
  const filteredVlanSegments = useMemo(() => vlanSegments.filter((item) => (vlanBusinessType === '全部' || item.businessType === vlanBusinessType) && (!query || [item.businessType, item.project, item.gateway, item.networkSegments.join(' '), item.vlanIds.join(' '), item.remark].some((value) => value.toLowerCase().includes(query.toLowerCase())))), [query, vlanBusinessType])
  const filteredVlanAllocations = useMemo(() => vlanAllocations.filter((item) => (vlanBusinessType === '全部' || vlanBusinessType === '设备网') && (!query || [item.zone, item.assetType, item.range, item.remark].some((value) => value.toLowerCase().includes(query.toLowerCase())))), [query, vlanBusinessType])
  const selectedVlan = filteredVlanSegments.find((item) => item.id === selectedVlanId) ?? filteredVlanSegments[0]
  const filteredLightingPages = useMemo(() => stageLightingPages.filter((item) => !query || [item.pageLabel, item.fixtureType, item.startAddress, item.stepRule, item.note].some((value) => value.toLowerCase().includes(query.toLowerCase()))), [query])
  const filteredControlLoops = useMemo(() => stageLightingControlLoops.filter((item) => !query || [item.groupLabel, item.description].some((value) => value.toLowerCase().includes(query.toLowerCase()))), [query])
  const filteredPowerLoops = useMemo(() => stageLightingPowerLoops.filter((item) => !query || [item.groupLabel, item.description].some((value) => value.toLowerCase().includes(query.toLowerCase()))), [query])
  const selectedLightingPage = filteredLightingPages.find((item) => item.id === selectedLightingPageId) ?? filteredLightingPages[0]
  const selectedGateway = backend.gateways.find((item) => item.id === selectedGatewayId) ?? backend.gateways[0]
  const selectedApp = backend.applications.find((item) => item.id === selectedAppId) ?? backend.applications[0]
  const onlineDevices = backend.devices.filter((item) => ['在线', '高负载', '预警'].includes(item.status)).length
  const configuredGateways = backend.gateways.filter((item) => item.status === '配置就绪').length
  const enabledApps = backend.applications.filter((item) => item.status === '已启用').length

  function saveDevice() {
    if (!deviceDraft?.id || !deviceDraft.name) return setFeedback('请填写设备编号和名称')
    const exists = backend.devices.some((item) => item.id === deviceDraft.id)
    exists ? backend.updateDevice(deviceDraft) : backend.addDevice(deviceDraft)
    setSelectedDeviceId(deviceDraft.id)
    setDeviceDraft(null)
    setFeedback(exists ? '设备信息已更新' : '设备已添加')
  }

  function saveApplication() {
    if (!appDraft?.id || !appDraft.name) return setFeedback('请填写应用编号和名称')
    const exists = backend.applications.some((item) => item.id === appDraft.id)
    exists ? backend.updateApplication(appDraft) : backend.addApplication(appDraft)
    setSelectedAppId(appDraft.id)
    setAppDraft(null)
    setFeedback(exists ? '外部应用配置已更新' : '外部应用已添加')
  }

  function confirmDelete() {
    if (!deleteTarget) return
    deleteTarget.kind === 'device' ? backend.deleteDevice(deleteTarget.id) : backend.deleteApplication(deleteTarget.id)
    setFeedback(`${deleteTarget.name}已从设备清单删除`)
    setDeleteTarget(null)
  }

  return <div className="page operations-page backend-page">
    <section className="page-command-row"><div className="backend-heading-actions"><span className="backend-priority"><ShieldCheck size={16}/>现场清单与接口配置</span><button className="danger-outline-button" onClick={() => { backend.resetBackend(); setFeedback('后台基础配置已恢复') }}><ListRestart size={15}/>重置后台数据</button></div></section>

    <section className="backend-summary">
      <SummaryCard icon={Boxes} label="设备资产" value={String(backend.devices.length)} note={`${onlineDevices}台在线或运行中`} tone="cyan"/>
      <SummaryCard icon={Cable} label="硬件适配器" value={String(backend.gateways.length)} note={`${configuredGateways}个配置就绪`} tone="orange"/>
      <SummaryCard icon={CloudCog} label="外部应用" value={String(backend.applications.length)} note={`${enabledApps}个已启用`} tone="purple"/>
      <SummaryCard icon={Code2} label="开放API" value={String(backend.apiEndpoints.length)} note={`${backend.apiEndpoints.filter((item) => item.status === '配置就绪').length}个配置就绪`} tone="green"/>
    </section>

    <section className="backend-workspace panel">
      <aside className="backend-tabs"><div className="backend-tabs-title"><Settings2 size={17}/><div><strong>后台配置中心</strong><span>ADMINISTRATION</span></div></div>{tabs.map(({ id, label, icon: Icon }) => <button className={tab === id ? 'active' : ''} onClick={() => { setTab(id); setQuery('') }} key={id}><Icon size={17}/><span>{label}</span><ChevronRight size={14}/></button>)}<div className="backend-boundary"><CircleAlert size={15}/><p>现场清单已加载；控制指令和密钥下发需在厂家接口联调后启用。</p></div></aside>
      <div className="backend-content">
        {tab === 'overview' && <BackendOverview devices={backend.devices.length} gateways={backend.gateways.length} apps={backend.applications.length} channels={backend.channels.length}/>}
        {tab === 'devices' && <DevicesPanel devices={filteredDevices} selected={selectedDevice} query={query} setQuery={setQuery} category={deviceCategory} setCategory={setDeviceCategory} onSelect={setSelectedDeviceId} onAdd={() => setDeviceDraft({ ...blankDevice, id: `DEV-${String(backend.devices.length + 1).padStart(3, '0')}` })} onEdit={() => selectedDevice && setDeviceDraft({ ...selectedDevice })} onDelete={() => selectedDevice && setDeleteTarget({ kind: 'device', id: selectedDevice.id, name: selectedDevice.name })}/>}
        {tab === 'vlan' && <VlanPanel segments={filteredVlanSegments} allocations={filteredVlanAllocations} selected={selectedVlan} query={query} setQuery={setQuery} businessType={vlanBusinessType} setBusinessType={setVlanBusinessType} onSelect={setSelectedVlanId}/>}
        {tab === 'lighting' && <StageLightingPanel pages={filteredLightingPages} selected={selectedLightingPage} controlLoops={filteredControlLoops} powerLoops={filteredPowerLoops} query={query} setQuery={setQuery} onSelect={setSelectedLightingPageId}/>}
        {tab === 'hardware' && <HardwarePanel gateways={backend.gateways} selected={selectedGateway} onSelect={setSelectedGatewayId} onEdit={() => selectedGateway && setGatewayDraft({ ...selectedGateway })} onTest={() => { if (selectedGateway) { backend.testGateway(selectedGateway.id); setFeedback(`${selectedGateway.name}配置连通性检查通过`) } }}/>}
        {tab === 'applications' && <ApplicationsPanel items={backend.applications} selected={selectedApp} query={query} setQuery={setQuery} onSelect={setSelectedAppId} onAdd={() => setAppDraft({ ...blankApplication, id: `APP-${String(backend.applications.length + 1).padStart(3, '0')}` })} onEdit={() => selectedApp && setAppDraft({ ...selectedApp, scopes: [...selectedApp.scopes] })} onToggle={() => { if (!selectedApp) return; const status = selectedApp.status === '已启用' ? '已停用' : '已启用'; backend.updateApplication({ ...selectedApp, status }); setFeedback(`应用已${status === '已启用' ? '启用' : '停用'}`) }} onDelete={() => selectedApp && setDeleteTarget({ kind: 'application', id: selectedApp.id, name: selectedApp.name })}/>}
        {tab === 'channels' && <ChannelsPanel channels={backend.channels} onEdit={(item) => setChannelDraft({ ...item })}/>}
        {tab === 'api' && <ApiPanel items={backend.apiEndpoints} query={query} setQuery={setQuery}/>}
        {tab === 'logs' && <LogsPanel items={backend.logs} query={query} setQuery={setQuery}/>}
      </div>
    </section>

    {deviceDraft && <ConfigModal title={backend.devices.some((item) => item.id === deviceDraft.id) ? '编辑设备资产' : '添加设备资产'} onClose={() => setDeviceDraft(null)} footer={<><button onClick={() => setDeviceDraft(null)}>取消</button><button className="primary" onClick={saveDevice}><Check size={14}/>保存设备</button></>}><DeviceForm value={deviceDraft} onChange={setDeviceDraft}/></ConfigModal>}
    {gatewayDraft && <ConfigModal title="硬件协议配置" onClose={() => setGatewayDraft(null)} footer={<><button onClick={() => setGatewayDraft(null)}>取消</button><button className="primary" onClick={() => { backend.updateGateway(gatewayDraft); setGatewayDraft(null); setFeedback('协议参数已保存') }}><Check size={14}/>保存配置</button></>}><GatewayForm value={gatewayDraft} onChange={setGatewayDraft}/></ConfigModal>}
    {appDraft && <ConfigModal title={backend.applications.some((item) => item.id === appDraft.id) ? '编辑外部应用' : '添加外部应用'} onClose={() => setAppDraft(null)} footer={<><button onClick={() => setAppDraft(null)}>取消</button><button className="primary" onClick={saveApplication}><Check size={14}/>保存应用</button></>}><ApplicationForm value={appDraft} onChange={setAppDraft}/></ConfigModal>}
    {channelDraft && <ConfigModal title="展示端渠道配置" onClose={() => setChannelDraft(null)} footer={<><button onClick={() => setChannelDraft(null)}>取消</button><button className="primary" onClick={() => { backend.updateChannel(channelDraft); setChannelDraft(null); setFeedback('展示端配置已保存') }}><Check size={14}/>保存配置</button></>}><ChannelForm value={channelDraft} onChange={setChannelDraft}/></ConfigModal>}
    {deleteTarget && <ConfigModal title="确认删除设备配置" onClose={() => setDeleteTarget(null)} footer={<><button onClick={() => setDeleteTarget(null)}>取消</button><button className="danger" onClick={confirmDelete}><Trash2 size={14}/>确认删除</button></>}><div className="delete-confirm"><CircleAlert size={30}/><p>即将删除“{deleteTarget.name}”。该操作只影响当前浏览器中的设备清单，可通过重置后台数据恢复。</p></div></ConfigModal>}
    {feedback && <div className="demo-toast backend-toast"><CircleCheck size={15}/><span>{feedback}</span><button onClick={() => setFeedback('')}><X size={13}/></button></div>}
  </div>
}

function BackendOverview({ devices, gateways, apps, channels }: { devices: number; gateways: number; apps: number; channels: number }) {
  return <div className="backend-overview"><PanelHead title="后台能力架构" description="将设备侧接入和应用侧输出分层管理，业务页面只依赖标准模型。"/><div className="architecture-lanes"><article><header><Cpu size={20}/><div><strong>硬件管理与协议接入</strong><span>{devices}台设备 · {gateways}个协议适配器</span></div></header><div className="architecture-flow"><Node icon={Boxes} title="现场设备" note="摄像头 / 门禁 / UPS"/><ChevronRight/><Node icon={Cable} title="协议网关" note="SDK / 国标 / SNMP" active/><ChevronRight/><Node icon={Database} title="标准数据模型" note="设备 / 状态 / 事件"/></div><ul><li>设备清单、生命周期和固件信息</li><li>协议、地址、鉴权和采集周期配置</li><li>连接测试、状态监测和操作审计</li></ul></article><article><header><Layers3 size={20}/><div><strong>前端衔接与开放能力</strong><span>{apps}个外部应用 · {channels}个展示渠道</span></div></header><div className="architecture-flow"><Node icon={Database} title="标准数据模型" note="统一业务服务"/><ChevronRight/><Node icon={Code2} title="开放接口层" note="Open API / 回调" active/><ChevronRight/><Node icon={MonitorCog} title="多端应用" note="Web / 大屏 / H5"/></div><ul><li>第三方应用、回调、认证和数据权限</li><li>公众端、管理端、大屏和移动端配置</li><li>接口目录、限流策略和调用方统计</li></ul></article></div><div className="backend-guidance"><ShieldCheck size={19}/><div><strong>实施原则</strong><p>现场清单和业务配置已载入；厂家接口接入后先开放只读能力，再评审控制类接口。</p></div></div></div>
}

function DevicesPanel({ devices, selected, query, setQuery, category, setCategory, onSelect, onAdd, onEdit, onDelete }: { devices: DeviceAsset[]; selected?: DeviceAsset; query: string; setQuery: (v: string) => void; category: string; setCategory: (v: string) => void; onSelect: (id: string) => void; onAdd: () => void; onEdit: () => void; onDelete: () => void }) {
  return <div><PanelHead title="设备资产清单" description="统一维护设备编号、型号、位置、地址、协议、固件和运行状态。" action={<button className="primary-button" onClick={onAdd}><Plus size={15}/>添加设备</button>}/><div className="backend-toolbar"><label><Search size={15}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索编号、名称、位置、IP或协议"/></label><label className="backend-select"><Filter size={14}/><select value={category} onChange={(e) => setCategory(e.target.value)}><option>全部</option>{['视频监控','人员通行','信息发布','机房动环','UPS电源','无线网络','网络基础设施','背景音乐','边缘网关'].map((item) => <option key={item}>{item}</option>)}</select></label><span>共 {devices.length} 台设备</span></div><div className="backend-split"><div className="backend-table device-admin-table"><div className="backend-table-head"><span>设备资产</span><span>分类/位置</span><span>网络与协议</span><span>状态</span></div>{devices.map((item) => <button className={selected?.id === item.id ? 'backend-table-row active' : 'backend-table-row'} onClick={() => onSelect(item.id)} key={item.id}><span><strong>{item.name}</strong><small>{item.id} · {item.vendor}</small></span><span><strong>{item.category}</strong><small>{item.location}</small></span><span><strong>{item.ip}</strong><small>{item.protocol}</small></span><Status value={item.status}/></button>)}{devices.length === 0 && <Empty/>}</div>{selected && <aside className="backend-detail"><div className="backend-device-icon"><Boxes size={24}/></div><h3>{selected.name}</h3><Status value={selected.status}/><dl><Detail label="资产编号" value={selected.id}/><Detail label="设备分类" value={selected.category}/><Detail label="厂家/型号" value={`${selected.vendor} / ${selected.model}`}/><Detail label="安装位置" value={selected.location}/><Detail label="地址" value={selected.ip}/><Detail label="接入协议" value={selected.protocol}/><Detail label="固件版本" value={selected.firmware}/><Detail label="最近心跳" value={selected.lastSeen}/></dl><div className="backend-detail-actions"><button onClick={onEdit}><Pencil size={14}/>编辑</button><button className="danger" onClick={onDelete}><Trash2 size={14}/>删除</button></div></aside>}</div></div>
}

function VlanPanel({ segments, allocations, selected, query, setQuery, businessType, setBusinessType, onSelect }: { segments: VlanSegment[]; allocations: typeof vlanAllocations; selected?: VlanSegment; query: string; setQuery: (v: string) => void; businessType: string; setBusinessType: (v: string) => void; onSelect: (id: string) => void }) {
  const vlanCount = Array.from(new Set(segments.flatMap((item) => item.vlanIds))).length
  const totalPlannedIps = segments.reduce((sum, item) => sum + (item.ipDevices ?? 0), 0)
  const totalExternalNeeds = segments.reduce((sum, item) => sum + (item.externalNeeds ?? 0), 0)
  const zones = Array.from(new Set(allocations.map((item) => item.zone))).length

  return <div>
    <PanelHead title="VLAN规划 / 网络规划" description="根据现场网络规划清单整理办公网、设备网、无线网的网段、网关、容量和安防地址分配规则。"/>
    <div className="backend-toolbar">
      <label><Search size={15}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索业务类型、项目、网段、VLAN或地址分配"/></label>
      <label className="backend-select"><Filter size={14}/><select value={businessType} onChange={(e) => setBusinessType(e.target.value)}><option>全部</option>{Array.from(new Set(vlanSegments.map((item) => item.businessType))).map((item) => <option key={item}>{item}</option>)}</select></label>
      <span>{segments.length} 条网段规划 · {allocations.length} 条地址分配</span>
    </div>

    <div className="vlan-summary-strip">
      <article><small>规划业务域</small><strong>{Array.from(new Set(segments.map((item) => item.businessType))).length}</strong><span>办公网 / 设备网 / 无线网</span></article>
      <article><small>唯一 VLAN</small><strong>{vlanCount}</strong><span>{Array.from(new Set(segments.flatMap((item) => item.vlanIds))).join(' / ')}</span></article>
      <article><small>规划 IP 数</small><strong>{totalPlannedIps}</strong><span>按现场清单设备数汇总</span></article>
      <article><small>外网需求</small><strong>{totalExternalNeeds}</strong><span>{zones} 个安防地址分配区域</span></article>
    </div>

    <div className="backend-split vlan-split">
      <div className="backend-table vlan-plan-table">
        <div className="backend-table-head"><span>业务类型 / 项目</span><span>网段规划</span><span>网关 / VLAN</span><span>地址容量</span></div>
        {segments.map((item) => <button className={selected?.id === item.id ? 'backend-table-row active' : 'backend-table-row'} onClick={() => onSelect(item.id)} key={item.id}>
          <span><strong>{item.businessType}</strong><small>{item.project}</small></span>
          <span><strong>{item.networkSegments[0]}</strong><small>{item.networkSegments.length > 1 ? `附加 ${item.networkSegments.length - 1} 条网段` : '单网段规划'}</small></span>
          <span><strong>{item.gateway}</strong><small>{item.vlanIds.map((vlan) => `VLAN ${vlan}`).join(' / ')}</small></span>
          <span><strong>{item.ipDevices ?? '--'} / {item.externalNeeds ?? '--'}</strong><small>设备数 / 外网需求</small></span>
        </button>)}
        {segments.length === 0 && <Empty/>}
      </div>

      {selected && <aside className="backend-detail vlan-detail">
        <div className="backend-device-icon purple"><Network size={24}/></div>
        <h3>{selected.project}</h3>
        <Status value={selected.businessType === '设备网' ? '配置就绪' : '已发布'}/>
        <div className="scope-list vlan-chip-list">
          <span>VLAN 编号</span>
          {selected.vlanIds.map((item) => <b key={item}>VLAN {item}</b>)}
        </div>
        <dl>
          <Detail label="业务类型" value={selected.businessType}/>
          <Detail label="默认网关" value={selected.gateway}/>
          <Detail label="规划设备数" value={selected.ipDevices ? `${selected.ipDevices}` : '未填写'}/>
          <Detail label="外网需求" value={selected.externalNeeds ? `${selected.externalNeeds}` : '未填写'}/>
        </dl>
        <div className="vlan-network-block">
          <span>网段明细</span>
          {selected.networkSegments.map((segment) => <code key={segment}>{segment}</code>)}
        </div>
        <div className="vlan-note">
          <strong>实施说明</strong>
          <p>{selected.remark || '当前条目没有补充说明。'}</p>
        </div>
      </aside>}
    </div>

    <div className="vlan-allocation-card">
      <div className="backend-panel-head">
        <div>
          <h2>安防地址分配</h2>
          <p>展示 B1F 与 1F 在 VLAN220 / VLAN221 上的监控、客流、门禁和闸机地址使用情况。</p>
        </div>
      </div>
      <div className="vlan-allocation-table">
        <div className="vlan-allocation-head"><span>区域 / VLAN</span><span>设备类型</span><span>地址范围</span><span>使用IP</span><span>预留IP</span><span>备注</span></div>
        {allocations.map((item) => <div className="vlan-allocation-row" key={item.id}>
          <span><strong>{item.zone}</strong></span>
          <span>{item.assetType}</span>
          <span>{item.range}</span>
          <span>{item.usedIPs ?? '--'}</span>
          <span>{item.reservedIPs ?? '--'}</span>
          <span>{item.remark || '—'}</span>
        </div>)}
      </div>
    </div>
  </div>
}

function StageLightingPanel({ pages, selected, controlLoops, powerLoops, query, setQuery, onSelect }: { pages: StageLightingPage[]; selected?: StageLightingPage; controlLoops: typeof stageLightingControlLoops; powerLoops: typeof stageLightingPowerLoops; query: string; setQuery: (v: string) => void; onSelect: (id: string) => void }) {
  return <div>
    <PanelHead title="舞台灯光配置" description="根据现场舞台灯光清单整理灯具页、起始地址、递增规则以及控制线回路说明，用于现场灯控对照。"/>
    <div className="backend-toolbar">
      <label><Search size={15}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索灯具页、灯具类型、地址规则或回路说明"/></label>
      <span>{pages.length} 组灯具页 · 控制线 {controlLoops.length} 组</span>
    </div>
    <div className="stage-lighting-layout backend-lighting-layout">
      <article className="panel stage-lighting-panel">
        <div className="panel-head">
          <div><p className="panel-kicker">STAGE LIGHTING</p><h2>舞台灯光场景配置</h2></div>
          <span className="catalog-hint">现场配置</span>
        </div>
        <div className="stage-lighting-pages">
          {pages.map((item) => <button key={item.id} className={selected?.id === item.id ? 'stage-page-card active' : 'stage-page-card'} onClick={() => onSelect(item.id)}>
            <span className="stage-page-icon"><Zap size={18} /></span>
            <div><strong>{item.fixtureType}</strong><small>{item.pageLabel}</small></div>
            <b>{item.startAddress}</b>
          </button>)}
        </div>
        {pages.length === 0 && <Empty/>}
        {selected && <div className="stage-page-detail">
          <header>
            <div><span>当前灯具页</span><h3>{selected.pageLabel} · {selected.fixtureType}</h3></div>
            <Status value="已配置" />
          </header>
          <div className="stage-page-metrics">
            <MetricDetail label="起始地址" value={selected.startAddress} />
            <MetricDetail label="递增规则" value={selected.stepRule} />
            <MetricDetail label="控制对象" value={selected.fixtureType} />
          </div>
          <div className="stage-page-note"><strong>配置说明</strong><p>{selected.note}</p></div>
        </div>}
      </article>
      <article className="panel stage-loop-panel">
        <div className="panel-head">
          <div><p className="panel-kicker">LOOPS & ROUTES</p><h2>舞台灯光回路说明</h2></div>
          <span className="catalog-hint">控制线 / 电源线</span>
        </div>
        <div className="stage-loop-columns">
          <section>
            <h3>控制线回路</h3>
            <div className="stage-loop-list">
              {controlLoops.map((item) => <div className="stage-loop-row" key={item.id}><span>{item.groupLabel}</span><strong>{item.description}</strong></div>)}
              {controlLoops.length === 0 && <div className="stage-loop-empty">没有匹配的控制线回路</div>}
            </div>
          </section>
          <section>
            <h3>电源线回路</h3>
            <div className="stage-loop-list power">
              {powerLoops.map((item) => <div className="stage-loop-row muted" key={item.id}><span>{item.groupLabel}</span><strong>{item.description}</strong></div>)}
              {powerLoops.length === 0 && <div className="stage-loop-empty">没有匹配的电源线回路</div>}
            </div>
          </section>
        </div>
      </article>
    </div>
  </div>
}

function HardwarePanel({ gateways, selected, onSelect, onEdit, onTest }: { gateways: HardwareGateway[]; selected?: HardwareGateway; onSelect: (id: string) => void; onEdit: () => void; onTest: () => void }) {
  return <div><PanelHead title="硬件与协议配置" description="为现场系统配置协议、地址、鉴权、采集周期和标准适配器。"/><div className="gateway-layout"><div className="gateway-list">{gateways.map((item) => <button className={selected?.id === item.id ? 'active' : ''} onClick={() => onSelect(item.id)} key={item.id}><span><Cable size={18}/></span><div><strong>{item.name}</strong><small>{item.id} · {item.protocol}</small></div><Status value={item.status}/></button>)}</div>{selected && <article className="gateway-detail"><header><div><span>协议适配器配置</span><h3>{selected.name}</h3></div><Status value={selected.status}/></header><div className="protocol-route"><Node icon={Cpu} title="现场系统" note={selected.system}/><ChevronRight/><Node icon={Cable} title={selected.protocol} note="协议转换" active/><ChevronRight/><Node icon={Database} title={selected.adapter} note="标准模型"/></div><div className="gateway-fields"><Detail label="厂家" value={selected.vendor}/><Detail label="接入地址" value={selected.endpoint}/><Detail label="鉴权方式" value={selected.authMode}/><Detail label="采集周期" value={selected.polling}/><Detail label="最近测试" value={selected.lastTest}/><Detail label="运行适配器" value={selected.adapter}/></div><div className="capability-block"><span>能力映射</span><div>{selected.capabilities.map((item) => <b key={item}><Check size={12}/>{item}</b>)}</div></div><footer><button onClick={onEdit}><SlidersHorizontal size={14}/>编辑协议参数</button><button className="primary" onClick={onTest}><Activity size={14}/>测试连接</button></footer></article>}</div></div>
}

function ApplicationsPanel({ items, selected, query, setQuery, onSelect, onAdd, onEdit, onToggle, onDelete }: { items: ExternalApplication[]; selected?: ExternalApplication; query: string; setQuery: (v: string) => void; onSelect: (id: string) => void; onAdd: () => void; onEdit: () => void; onToggle: () => void; onDelete: () => void }) {
  const filtered = items.filter((item) => !query || Object.values(item).some((value) => String(value).toLowerCase().includes(query.toLowerCase())))
  return <div><PanelHead title="外部系统接入" description="管理其他系统接入本平台时的地址、认证、回调和数据权限。" action={<button className="primary-button" onClick={onAdd}><Plus size={15}/>添加外部应用</button>}/><div className="backend-toolbar"><label><Search size={15}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索应用、负责部门或认证方式"/></label><span>已登记 {items.length} 个应用</span></div><div className="backend-split"><div className="backend-table app-admin-table"><div className="backend-table-head"><span>应用</span><span>类型/负责方</span><span>认证方式</span><span>状态</span></div>{filtered.map((item) => <button className={selected?.id === item.id ? 'backend-table-row active' : 'backend-table-row'} onClick={() => onSelect(item.id)} key={item.id}><span><strong>{item.name}</strong><small>{item.id}</small></span><span><strong>{item.type}</strong><small>{item.owner}</small></span><span><strong>{item.authMode}</strong><small>{item.lastSync}</small></span><Status value={item.status}/></button>)}</div>{selected && <aside className="backend-detail app-detail"><div className="backend-device-icon purple"><CloudCog size={24}/></div><h3>{selected.name}</h3><Status value={selected.status}/><dl><Detail label="应用编号" value={selected.id}/><Detail label="应用类型" value={selected.type}/><Detail label="负责部门" value={selected.owner}/><Detail label="基础地址" value={selected.baseUrl}/><Detail label="回调路径" value={selected.callback}/><Detail label="认证方式" value={selected.authMode}/></dl><div className="scope-list"><span>数据权限</span>{selected.scopes.map((scope) => <b key={scope}>{scope}</b>)}</div><div className="backend-detail-actions three"><button onClick={onEdit}><Pencil size={14}/>编辑</button><button onClick={onToggle}>{selected.status === '已启用' ? <Unplug size={14}/> : <Link2 size={14}/>} {selected.status === '已启用' ? '停用' : '启用'}</button><button className="danger" onClick={onDelete}><Trash2 size={14}/>删除</button></div></aside>}</div></div>
}

function ChannelsPanel({ channels, onEdit }: { channels: FrontendChannel[]; onEdit: (item: FrontendChannel) => void }) {
  return <div><PanelHead title="展示端与前端衔接" description="配置公众端、管理端、数据大屏和移动端的路由、主题与数据范围。"/><div className="channel-grid">{channels.map((item) => <article key={item.id}><header><span><MonitorCog size={20}/></span><Status value={item.status}/></header><small>{item.id} · {item.kind}</small><h3>{item.name}</h3><div className="channel-route"><FileCode2 size={14}/><code>{item.route}</code></div><dl><Detail label="视觉主题" value={item.theme}/><Detail label="数据范围" value={item.dataScope}/><Detail label="版本" value={item.version}/></dl><button onClick={() => onEdit(item)}><Pencil size={14}/>编辑渠道配置</button></article>)}</div></div>
}

function ApiPanel({ items, query, setQuery }: { items: ReturnType<typeof useBackend>['apiEndpoints']; query: string; setQuery: (v: string) => void }) {
  const filtered = items.filter((item) => !query || Object.values(item).some((value) => String(value).toLowerCase().includes(query.toLowerCase())))
  return <div><PanelHead title="开放 API 目录" description="为其他展示界面和业务系统预留统一查询、上报及回调接口。" action={<button className="outline-button"><FileCode2 size={15}/>导出接口清单</button>}/><div className="backend-toolbar"><label><Search size={15}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索接口、路径或业务域"/></label><span>{filtered.length} 个接口</span></div><div className="api-table"><div className="api-head"><span>方法</span><span>接口名称与路径</span><span>业务域</span><span>认证</span><span>限流</span><span>调用方</span><span>状态</span></div>{filtered.map((item) => <div className="api-row" key={item.id}><b className={`method ${item.method.toLowerCase()}`}>{item.method}</b><span><strong>{item.name}</strong><code>{item.path}</code></span><span>{item.domain}</span><span><KeyRound size={12}/>{item.auth}</span><span>{item.rateLimit}</span><span>{item.consumers}个</span><Status value={item.status}/></div>)}</div></div>
}

function LogsPanel({ items, query, setQuery }: { items: ReturnType<typeof useBackend>['logs']; query: string; setQuery: (v: string) => void }) {
  const filtered = items.filter((item) => !query || Object.values(item).some((value) => String(value).toLowerCase().includes(query.toLowerCase())))
  return <div><PanelHead title="后台操作日志" description="记录设备、协议、应用和展示端配置的管理动作。"/><div className="backend-toolbar"><label><Search size={15}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索操作人、模块、动作或对象"/></label><span>最近 {filtered.length} 条</span></div><div className="log-table"><div className="log-head"><span>时间</span><span>操作人</span><span>模块</span><span>操作</span><span>对象</span><span>结果</span></div>{filtered.map((item) => <div className="log-row" key={item.id}><time>{item.time}</time><span>{item.operator}</span><span>{item.module}</span><strong>{item.action}</strong><code>{item.target}</code><Status value={item.result}/></div>)}</div></div>
}

function DeviceForm({ value, onChange }: { value: DeviceAsset; onChange: (v: DeviceAsset) => void }) {
  return <div className="config-form"><Field label="设备编号"><input value={value.id} onChange={(e) => onChange({ ...value, id: e.target.value })}/></Field><Field label="设备名称"><input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })}/></Field><Field label="设备分类"><select value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value })}>{['视频监控','人员通行','信息发布','机房动环','UPS电源','无线网络','网络基础设施','背景音乐','边缘网关'].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="厂家"><input value={value.vendor} onChange={(e) => onChange({ ...value, vendor: e.target.value })}/></Field><Field label="型号"><input value={value.model} onChange={(e) => onChange({ ...value, model: e.target.value })}/></Field><Field label="安装位置"><input value={value.location} onChange={(e) => onChange({ ...value, location: e.target.value })}/></Field><Field label="IP/端口/总线地址"><input value={value.ip} onChange={(e) => onChange({ ...value, ip: e.target.value })}/></Field><Field label="接入协议"><input value={value.protocol} onChange={(e) => onChange({ ...value, protocol: e.target.value })}/></Field><Field label="运行状态"><select value={value.status} onChange={(e) => onChange({ ...value, status: e.target.value })}>{['在线','离线','故障','高负载','预警','待配置'].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="固件版本"><input value={value.firmware} onChange={(e) => onChange({ ...value, firmware: e.target.value })}/></Field></div>
}

function GatewayForm({ value, onChange }: { value: HardwareGateway; onChange: (v: HardwareGateway) => void }) {
  return <div className="config-form"><Field label="接入编号"><input value={value.id} disabled/></Field><Field label="系统名称"><input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })}/></Field><Field label="厂家"><input value={value.vendor} onChange={(e) => onChange({ ...value, vendor: e.target.value })}/></Field><Field label="协议方式"><input value={value.protocol} onChange={(e) => onChange({ ...value, protocol: e.target.value })}/></Field><Field label="接入地址" wide><input value={value.endpoint} onChange={(e) => onChange({ ...value, endpoint: e.target.value })}/></Field><Field label="鉴权方式"><input value={value.authMode} onChange={(e) => onChange({ ...value, authMode: e.target.value })}/></Field><Field label="采集周期"><input value={value.polling} onChange={(e) => onChange({ ...value, polling: e.target.value })}/></Field><Field label="适配器"><input value={value.adapter} onChange={(e) => onChange({ ...value, adapter: e.target.value })}/></Field><Field label="配置状态"><select value={value.status} onChange={(e) => onChange({ ...value, status: e.target.value })}><option>配置就绪</option><option>待配置</option><option>已停用</option></select></Field></div>
}

function ApplicationForm({ value, onChange }: { value: ExternalApplication; onChange: (v: ExternalApplication) => void }) {
  return <div className="config-form"><Field label="应用编号"><input value={value.id} onChange={(e) => onChange({ ...value, id: e.target.value })}/></Field><Field label="应用名称"><input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })}/></Field><Field label="应用类型"><input value={value.type} onChange={(e) => onChange({ ...value, type: e.target.value })}/></Field><Field label="负责部门"><input value={value.owner} onChange={(e) => onChange({ ...value, owner: e.target.value })}/></Field><Field label="基础地址" wide><input value={value.baseUrl} onChange={(e) => onChange({ ...value, baseUrl: e.target.value })}/></Field><Field label="回调路径"><input value={value.callback} onChange={(e) => onChange({ ...value, callback: e.target.value })}/></Field><Field label="认证方式"><input value={value.authMode} onChange={(e) => onChange({ ...value, authMode: e.target.value })}/></Field><Field label="权限范围" wide><input value={value.scopes.join(', ')} onChange={(e) => onChange({ ...value, scopes: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) })}/></Field><Field label="状态"><select value={value.status} onChange={(e) => onChange({ ...value, status: e.target.value })}><option>已启用</option><option>已停用</option><option>待配置</option></select></Field></div>
}

function ChannelForm({ value, onChange }: { value: FrontendChannel; onChange: (v: FrontendChannel) => void }) {
  return <div className="config-form"><Field label="渠道编号"><input value={value.id} disabled/></Field><Field label="渠道名称"><input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })}/></Field><Field label="渠道类型"><input value={value.kind} onChange={(e) => onChange({ ...value, kind: e.target.value })}/></Field><Field label="访问路由"><input value={value.route} onChange={(e) => onChange({ ...value, route: e.target.value })}/></Field><Field label="视觉主题"><input value={value.theme} onChange={(e) => onChange({ ...value, theme: e.target.value })}/></Field><Field label="版本"><input value={value.version} onChange={(e) => onChange({ ...value, version: e.target.value })}/></Field><Field label="数据范围" wide><textarea value={value.dataScope} onChange={(e) => onChange({ ...value, dataScope: e.target.value })}/></Field><Field label="状态"><select value={value.status} onChange={(e) => onChange({ ...value, status: e.target.value })}><option>已发布</option><option>预留</option><option>已停用</option></select></Field></div>
}

function ConfigModal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer: ReactNode }) {
  return <div className="config-modal-backdrop"><section className="config-modal"><header><div><span>SIMULATION CONFIGURATION</span><h2>{title}</h2></div><button onClick={onClose}><X size={18}/></button></header><div className="config-modal-body">{children}</div><footer>{footer}</footer></section></div>
}

function PanelHead({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <div className="backend-panel-head"><div><h2>{title}</h2><p>{description}</p></div>{action}</div> }
function SummaryCard({ icon: Icon, label, value, note, tone }: { icon: typeof Boxes; label: string; value: string; note: string; tone: string }) { return <article className={`backend-summary-card ${tone}`}><span><Icon size={20}/></span><div><small>{label}</small><strong>{value}</strong><p>{note}</p></div></article> }
function Node({ icon: Icon, title, note, active }: { icon: typeof Boxes; title: string; note: string; active?: boolean }) { return <div className={active ? 'architecture-node active' : 'architecture-node'}><Icon size={19}/><strong>{title}</strong><span>{note}</span></div> }
function Detail({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd>{value}</dd></div> }
function MetricDetail({ label, value }: { label: string; value: string }) { return <div className="detail-item"><span>{label}</span><strong>{value}</strong></div> }
function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) { return <label className={wide ? 'wide' : ''}><span>{label}</span>{children}</label> }
function Status({ value }: { value: string }) { const tone = ['故障','离线','已停用'].includes(value) ? 'danger' : ['预警','高负载','待配置','草案','即将满员'].includes(value) ? 'warning' : ['在线','配置就绪','已启用','已发布','配置就绪','成功','已配置'].includes(value) ? 'success' : 'info'; return <b className={`backend-status ${tone}`}>{value}</b> }
function Empty() { return <div className="backend-empty"><Search size={25}/><strong>没有匹配的数据</strong><span>调整搜索或筛选条件</span></div> }
