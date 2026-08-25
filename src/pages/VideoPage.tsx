import {
  CalendarDays,
  Camera as CameraIcon,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock3,
  Download,
  Expand,
  Grid2X2,
  HardDrive,
  Info,
  ListFilter,
  LoaderCircle,
  MapPin,
  Maximize,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Volume2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { loadCameraConfig } from '../services/configService'
import type { Camera, CameraConfig, CameraStatus } from '../types/video'

const statusText: Record<CameraStatus, string> = {
  online: '在线',
  offline: '离线',
  fault: '故障',
}

const recordingSegments = [
  { start: '00:00', end: '06:12', type: '定时录像', color: 'cyan' },
  { start: '06:12', end: '06:18', type: '移动侦测', color: 'orange' },
  { start: '06:18', end: '12:30', type: '定时录像', color: 'cyan' },
  { start: '12:30', end: '12:36', type: '事件录像', color: 'red' },
  { start: '12:36', end: '18:00', type: '定时录像', color: 'cyan' },
  { start: '18:00', end: '23:59', type: '定时录像', color: 'cyan' },
]

export function VideoPage() {
  const [config, setConfig] = useState<CameraConfig | null>(null)
  const [loadError, setLoadError] = useState('')
  const [selectedId, setSelectedId] = useState('CAM-F1-001')
  const [expandedFloors, setExpandedFloors] = useState<string[]>(['F1', 'F2'])
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<'live' | 'replay'>('live')
  const [layout, setLayout] = useState<'single' | 'quad'>('single')
  const [playing, setPlaying] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState(0)
  const [statusFilter, setStatusFilter] = useState<'all' | CameraStatus>('all')
  const [refreshing, setRefreshing] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [replayDate, setReplayDate] = useState('2026-08-24')

  async function refreshConfig(notify = true) {
    setRefreshing(true)
    try {
      const data = await loadCameraConfig()
      setConfig(data)
      if (!data.cameras.some((camera) => camera.id === selectedId)) {
        setSelectedId(data.cameras[0]?.id ?? '')
      }
      if (notify) setFeedback(`设备目录已刷新 · ${data.cameras.length}路摄像头`)
    } catch (error: unknown) {
      setLoadError(error instanceof Error ? error.message : '摄像头配置加载失败')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void refreshConfig(false)
  }, [])

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(''), 2600)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const selectedCamera = config?.cameras.find((camera) => camera.id === selectedId) ?? null
  const filteredCameras = useMemo(() => {
    if (!config) return []
    const keyword = query.trim().toLowerCase()
    return config.cameras.filter((camera) => {
      const matchesStatus = statusFilter === 'all' || camera.status === statusFilter
      const matchesKeyword = !keyword || [camera.name, camera.id, camera.area, camera.position].some((value) => value.toLowerCase().includes(keyword))
      return matchesStatus && matchesKeyword
    })
  }, [config, query, statusFilter])

  function toggleFloor(floorId: string) {
    setExpandedFloors((items) => items.includes(floorId) ? items.filter((item) => item !== floorId) : [...items, floorId])
  }

  function selectCamera(camera: Camera) {
    setSelectedId(camera.id)
    setPlaying(false)
  }

  if (loadError) {
    return <div className="page"><div className="load-error"><CircleAlert size={30} /><h2>配置加载失败</h2><p>{loadError}</p></div></div>
  }

  if (!config || !selectedCamera) {
    return <div className="page"><div className="loading-state"><LoaderCircle size={24} />正在加载摄像头配置…</div></div>
  }

  const onlineCount = config.cameras.filter((camera) => camera.status === 'online').length

  return (
    <div className="page video-page">
      <section className="page-heading video-heading">
        <div>
          <p className="eyebrow">VIDEO SURVEILLANCE</p>
          <h1>视频监控管理</h1>
          <p>按楼层管理馆区摄像头，查看模拟实况与录像回放</p>
        </div>
        <div className="video-summary">
          <span><i className="online" />在线 <strong>{onlineCount}</strong></span>
          <span><i className="fault" />异常 <strong>{config.cameras.length - onlineCount}</strong></span>
          <span><CameraIcon size={15} />总数 <strong>{config.cameras.length}</strong></span>
        </div>
      </section>

      <section className="video-workspace">
        <aside className="camera-tree panel">
          <div className="camera-tree-head">
            <div><p className="panel-kicker">设备目录</p><h2>馆区摄像头</h2></div>
            <button title="刷新设备" onClick={() => void refreshConfig()}><RefreshCw className={refreshing ? 'spinning' : ''} size={15} /></button>
          </div>
          <label className="module-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索名称、ID或位置" /></label>
          <div className="tree-filter"><span>{statusFilter === 'all' ? '全部设备' : statusText[statusFilter]}</span><label><ListFilter size={14} /><select aria-label="状态筛选" value={statusFilter} onChange={(event) => {
            const nextFilter = event.target.value as 'all' | CameraStatus
            setStatusFilter(nextFilter)
            const firstMatch = nextFilter === 'all' ? config.cameras[0] : config.cameras.find((camera) => camera.status === nextFilter)
            if (firstMatch) selectCamera(firstMatch)
          }}><option value="all">全部状态</option><option value="online">在线</option><option value="fault">故障</option><option value="offline">离线</option></select></label></div>
          <div className="floor-tree">
            {config.floors.map((floor) => {
              const cameras = filteredCameras.filter((camera) => camera.floorId === floor.id)
              const expanded = expandedFloors.includes(floor.id)
              return (
                <div className="floor-group" key={floor.id}>
                  <button className="floor-row" onClick={() => toggleFloor(floor.id)}>
                    {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    <strong>{floor.name}</strong><span>{cameras.length} 路</span>
                  </button>
                  {expanded && <div className="camera-items">
                    {cameras.map((camera) => (
                      <button key={camera.id} className={camera.id === selectedId ? 'camera-item active' : 'camera-item'} onClick={() => selectCamera(camera)}>
                        <span className={`camera-status ${camera.status}`}><CameraIcon size={14} /></span>
                        <span className="camera-label"><strong>{camera.name}</strong><small>{camera.id} · {camera.area}</small></span>
                        <i className={camera.status} title={statusText[camera.status]} />
                      </button>
                    ))}
                    {cameras.length === 0 && <p className="tree-empty">没有匹配的摄像头</p>}
                  </div>}
                </div>
              )
            })}
          </div>
          <div className="tree-foot"><HardDrive size={14} /><span>录像保存</span><strong>30天</strong></div>
        </aside>

        <div className="video-main">
          <article className="player-card panel">
            <div className="player-toolbar">
              <div className="mode-tabs">
                <button className={mode === 'live' ? 'active' : ''} onClick={() => { setMode('live'); setPlaying(false) }}>实时预览</button>
                <button className={mode === 'replay' ? 'active' : ''} onClick={() => { setMode('replay'); setPlaying(false) }}>录像回放</button>
              </div>
              <div className="player-tools">
                <button className={layout === 'single' ? 'active' : ''} onClick={() => setLayout('single')} title="单画面"><Maximize size={15} /></button>
                <button className={layout === 'quad' ? 'active' : ''} onClick={() => setLayout('quad')} title="四画面"><Grid2X2 size={15} /></button>
                <button title="画面参数"><SlidersHorizontal size={15} /></button>
              </div>
            </div>

            <div className={`monitor-grid ${layout}`}>
              <CameraViewport camera={selectedCamera} mode={mode} playing={playing} primary onReconnect={() => setFeedback(`正在重新连接 ${selectedCamera.name}`)} />
              {layout === 'quad' && config.cameras.filter((camera) => camera.id !== selectedCamera.id).slice(0, 3).map((camera) => <CameraViewport key={camera.id} camera={camera} mode={mode} playing={false} onReconnect={() => setFeedback(`正在重新连接 ${camera.name}`)} />)}
            </div>

            <div className="player-controls">
              <div className="control-left">
                {mode === 'replay' && <button title="后退10秒" onClick={() => setFeedback('录像已后退10秒')}><SkipBack size={16} /></button>}
                <button className="play-button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? '暂停' : '播放'}>{playing ? <Pause size={17} /> : <Play size={17} />}</button>
                {mode === 'replay' && <button title="前进10秒" onClick={() => setFeedback('录像已前进10秒')}><SkipForward size={16} /></button>}
                <button title="音量" onClick={() => setFeedback('音量控制已打开')}><Volume2 size={17} /></button>
                <span className="play-time">{mode === 'live' ? '实时' : '10:36:18 / 23:59:59'}</span>
              </div>
              <div className="control-right">
                <button className="definition-button" onClick={() => setFeedback('当前清晰度：高清')}>高清 <ChevronDown size={13} /></button>
                <button title="抓拍" onClick={() => setFeedback('抓拍任务已模拟完成')}><CameraIcon size={17} /></button>
                <button title="下载录像" onClick={() => setFeedback('已创建模拟录像下载任务')}><Download size={17} /></button>
                <button title="全屏" onClick={() => setFeedback('全屏播放将在接入视频后启用')}><Expand size={17} /></button>
              </div>
            </div>
          </article>

          {mode === 'replay' && <article className="replay-panel panel">
            <div className="replay-query">
              <label><CalendarDays size={15} /><span>录像日期</span><input type="date" value={replayDate} onChange={(event) => setReplayDate(event.target.value)} /></label>
              <label><Clock3 size={15} /><span>录像类型</span><select defaultValue="all"><option value="all">全部录像</option><option>定时录像</option><option>事件录像</option></select></label>
              <button className="primary-button" onClick={() => setFeedback(`已查询 ${replayDate} 的6段录像`)}><Search size={15} />查询录像</button>
            </div>
            <div className="timeline-ruler"><span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>24:00</span></div>
            <div className="recording-track">
              {recordingSegments.map((segment, index) => <button key={`${segment.start}-${segment.end}`} onClick={() => setSelectedSegment(index)} className={`${segment.color} ${selectedSegment === index ? 'active' : ''}`} style={{ flex: index === 1 || index === 3 ? .18 : 1 }} title={`${segment.type} ${segment.start}-${segment.end}`} />)}
              <i style={{ left: '44%' }} />
            </div>
            <div className="segment-list">
              {recordingSegments.slice(0, 4).map((segment, index) => <button key={segment.start} onClick={() => setSelectedSegment(index)} className={selectedSegment === index ? 'active' : ''}><span className={segment.color} /><strong>{segment.start}—{segment.end}</strong><small>{segment.type}</small><Play size={13} /></button>)}
            </div>
          </article>}

          <article className="camera-detail panel">
            <div className="detail-title"><div><p className="panel-kicker">当前设备</p><h2>{selectedCamera.name}</h2></div><span className={`device-state ${selectedCamera.status}`}><i />{statusText[selectedCamera.status]}</span></div>
            <div className="camera-meta">
              <div><span>摄像头ID</span><strong>{selectedCamera.id}</strong></div>
              <div><span>安装位置</span><strong>{selectedCamera.position}</strong></div>
              <div><span>设备型号</span><strong>{selectedCamera.model}</strong></div>
              <div><span>视频规格</span><strong>{selectedCamera.resolution} · {selectedCamera.channel}</strong></div>
              <div><span>设备地址</span><strong>{selectedCamera.ip}</strong></div>
              <div><span>最后在线</span><strong>{selectedCamera.lastOnline}</strong></div>
            </div>
            <div className="detail-actions"><button onClick={() => setFeedback(`已定位：${selectedCamera.position}`)}><MapPin size={15} />地图定位</button><button onClick={() => setFeedback(`${selectedCamera.id} 设备档案已加载`)}><Info size={15} />设备档案</button><button onClick={() => setFeedback(`正在重新连接 ${selectedCamera.name}`)}><RotateCcw size={15} />模拟重连</button></div>
          </article>
        </div>
      </section>
      {feedback && <div className="demo-toast"><CircleAlert size={15} /><span>{feedback}</span></div>}
    </div>
  )
}

function CameraViewport({ camera, mode, playing, primary = false, onReconnect }: { camera: Camera; mode: 'live' | 'replay'; playing: boolean; primary?: boolean; onReconnect: () => void }) {
  return (
    <div className={`camera-viewport ${primary ? 'primary' : ''}`}>
      <div className="video-noise" />
      <div className="video-overlay-top"><span className={`record-dot ${mode}`}>{mode === 'live' ? 'LIVE' : 'PLAYBACK'}</span><span>{camera.id} · {camera.channel}</span><time>2026-08-24　10:42:36</time></div>
      {camera.videoUrl ? <video src={camera.videoUrl} autoPlay={playing} muted /> : <div className="signal-state">
        <span className={`signal-icon ${camera.status}`}><CircleAlert size={30} /></span>
        <strong>{camera.status === 'online' ? '暂无视频信号' : '网络故障'}</strong>
        <p>{camera.status === 'online' ? '演示视频待配置，播放控制功能可正常体验' : `设备${statusText[camera.status]}，正在等待网络恢复`}</p>
        {primary && <button onClick={onReconnect}><RefreshCw size={14} />重新连接</button>}
      </div>}
      <div className="viewport-label"><i className={camera.status} /><span>{camera.name}</span><small>{camera.area}</small></div>
    </div>
  )
}
