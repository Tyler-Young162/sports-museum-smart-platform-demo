import {
  CalendarDays,
  Camera as CameraIcon,
  ChevronDown,
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
import { useEffect, useMemo, useRef, useState } from 'react'
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
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<'live' | 'replay'>('live')
  const [layout, setLayout] = useState<'single' | 'quad'>('quad')
  const [playing, setPlaying] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState(0)
  const [statusFilter, setStatusFilter] = useState<'all' | CameraStatus>('all')
  const [refreshing, setRefreshing] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [replayDate, setReplayDate] = useState('2026-08-24')
  const [recordingType, setRecordingType] = useState('all')
  const catalogRef = useRef<HTMLDivElement | null>(null)
  const playerCardRef = useRef<HTMLElement | null>(null)
  const floorRefs = useRef<Record<string, HTMLElement | null>>({})
  const cameraRefs = useRef<Record<string, HTMLElement | null>>({})
  const programmaticScrollRef = useRef(false)
  const scrollReleaseTimerRef = useRef<number | null>(null)

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

  useEffect(() => () => {
    if (scrollReleaseTimerRef.current) window.clearTimeout(scrollReleaseTimerRef.current)
  }, [])

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

  useEffect(() => {
    if (filteredCameras.length > 0 && !filteredCameras.some((camera) => camera.id === selectedId)) {
      setSelectedId(filteredCameras[0].id)
    }
  }, [filteredCameras, selectedId])

  function selectCamera(camera: Camera, shouldScroll = false) {
    setSelectedId(camera.id)
    setPlaying(false)
    if (shouldScroll) {
      programmaticScrollRef.current = true
      if (scrollReleaseTimerRef.current) window.clearTimeout(scrollReleaseTimerRef.current)
      cameraRefs.current[camera.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      scrollReleaseTimerRef.current = window.setTimeout(() => { programmaticScrollRef.current = false }, 1200)
    }
  }

  function scrollToFloor(floorId: string) {
    const firstCamera = filteredCameras.find((camera) => camera.floorId === floorId)
    if (firstCamera) setSelectedId(firstCamera.id)
    programmaticScrollRef.current = true
    if (scrollReleaseTimerRef.current) window.clearTimeout(scrollReleaseTimerRef.current)
    floorRefs.current[floorId]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    scrollReleaseTimerRef.current = window.setTimeout(() => { programmaticScrollRef.current = false }, 1200)
  }

  function syncDirectoryWithScroll() {
    if (programmaticScrollRef.current) return
    const catalog = catalogRef.current
    if (!catalog) return
    const catalogRect = catalog.getBoundingClientRect()
    const selectedElement = cameraRefs.current[selectedId]
    if (selectedElement) {
      const selectedRect = selectedElement.getBoundingClientRect()
      if (selectedRect.bottom > catalogRect.top + 54 && selectedRect.top < catalogRect.bottom) return
    }
    const visibleCamera = filteredCameras
      .map((camera) => ({ camera, element: cameraRefs.current[camera.id] }))
      .filter((item): item is { camera: Camera; element: HTMLElement } => Boolean(item.element))
      .filter(({ element }) => {
        const rect = element.getBoundingClientRect()
        return rect.bottom > catalogRect.top + 54 && rect.top < catalogRect.bottom
      })
      .sort((a, b) => Math.abs(a.element.getBoundingClientRect().top - catalogRect.top - 72) - Math.abs(b.element.getBoundingClientRect().top - catalogRect.top - 72))[0]
    if (visibleCamera && visibleCamera.camera.id !== selectedId) setSelectedId(visibleCamera.camera.id)
  }

  if (loadError) {
    return <div className="page"><div className="load-error"><CircleAlert size={30} /><h2>配置加载失败</h2><p>{loadError}</p></div></div>
  }

  if (!config || !selectedCamera) {
    return <div className="page"><div className="loading-state"><LoaderCircle size={24} />正在加载摄像头配置…</div></div>
  }

  const onlineCount = config.cameras.filter((camera) => camera.status === 'online').length
  const visibleRecordingSegments = recordingType === 'all' ? recordingSegments : recordingSegments.filter((segment) => segment.type === recordingType)

  async function enterFullscreen() {
    if (!playerCardRef.current) return
    try {
      await playerCardRef.current.requestFullscreen()
      setFeedback('已进入全屏监控模式')
    } catch {
      setFeedback('当前浏览器未授权全屏显示')
    }
  }

  return (
    <div className="page video-page">
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
              const activeFloor = selectedCamera.floorId === floor.id
              return (
                <div className="floor-group" key={floor.id}>
                  <button className={activeFloor ? 'floor-row active' : 'floor-row'} onClick={() => scrollToFloor(floor.id)}>
                    <ChevronDown size={15} />
                    <strong>{floor.name}</strong><span>{cameras.length} 路</span>
                  </button>
                  <div className="camera-items">
                    {cameras.map((camera) => (
                      <button key={camera.id} className={camera.id === selectedId ? 'camera-item active' : 'camera-item'} onClick={() => selectCamera(camera, true)}>
                        <span className={`camera-status ${camera.status}`}><CameraIcon size={14} /></span>
                        <span className="camera-label"><strong>{camera.name}</strong><small>{camera.id} · {camera.area}</small></span>
                        <i className={camera.status} title={statusText[camera.status]} />
                      </button>
                    ))}
                    {cameras.length === 0 && <p className="tree-empty">没有匹配的摄像头</p>}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="tree-foot"><HardDrive size={14} /><span>录像保存</span><strong>30天</strong></div>
        </aside>

        <div className="video-main">
          <article className="selected-camera-strip panel">
            <div className="selected-camera-identity">
              <span className={`camera-status ${selectedCamera.status}`}><CameraIcon size={15} /></span>
              <div><p className="panel-kicker">当前选中</p><h2>{selectedCamera.name}</h2></div>
              <span className={`device-state ${selectedCamera.status}`}><i />{statusText[selectedCamera.status]}</span>
            </div>
            <div className="selected-camera-facts">
              <span><small>摄像头ID</small><strong>{selectedCamera.id}</strong></span>
              <span><small>安装位置</small><strong>{selectedCamera.position}</strong></span>
              <span><small>地址 / 通道</small><strong>{selectedCamera.ip} · {selectedCamera.channel}</strong></span>
              <span><small>规格</small><strong>{selectedCamera.resolution}</strong></span>
            </div>
            <div className="video-summary compact" aria-label="摄像头状态统计">
              <span><i className="online" />在线 <strong>{onlineCount}</strong></span>
              <span><i className="fault" />异常 <strong>{config.cameras.length - onlineCount}</strong></span>
              <span><CameraIcon size={13} />总数 <strong>{config.cameras.length}</strong></span>
            </div>
            <div className="selected-camera-actions">
              <button title="地图定位" onClick={() => setFeedback(`已定位：${selectedCamera.position}`)}><MapPin size={15} /></button>
              <button title="设备档案" onClick={() => setFeedback(`${selectedCamera.id} 设备档案已加载`)}><Info size={15} /></button>
              <button title="重新连接" onClick={() => setFeedback(`正在重新连接 ${selectedCamera.name}`)}><RotateCcw size={15} /></button>
            </div>
          </article>

          <article ref={playerCardRef} className="player-card camera-catalog-card panel">
            <div className="player-toolbar">
              <div className="mode-tabs">
                <button className={mode === 'live' ? 'active' : ''} onClick={() => { setMode('live'); setPlaying(false) }}>实时预览</button>
                <button className={mode === 'replay' ? 'active' : ''} onClick={() => { setMode('replay'); setPlaying(false) }}>录像回放</button>
              </div>
              <span className="catalog-hint">完整摄像头列表 · 可上下滚动，左侧目录自动跟随</span>
              <div className="player-tools">
                <button className={layout === 'single' ? 'active' : ''} onClick={() => setLayout('single')} title="单列列表"><Maximize size={15} /></button>
                <button className={layout === 'quad' ? 'active' : ''} onClick={() => setLayout('quad')} title="田字格列表"><Grid2X2 size={15} /></button>
                <button title="画面参数"><SlidersHorizontal size={15} /></button>
              </div>
            </div>

            <div ref={catalogRef} className="camera-catalog-scroll" onScroll={syncDirectoryWithScroll}>
              {config.floors.map((floor) => {
                const floorCameras = filteredCameras.filter((camera) => camera.floorId === floor.id)
                if (floorCameras.length === 0) return null
                return <section className="camera-floor-section" key={floor.id} ref={(element) => { floorRefs.current[floor.id] = element }}>
                  <div className="camera-section-title">
                    <div><span>{floor.id}</span><h2>{floor.name}摄像头</h2></div>
                    <p>{floor.areas.join(' · ')}</p>
                    <strong>{floorCameras.length} 路</strong>
                  </div>
                  <div className={`camera-catalog-grid ${layout}`}>
                    {floorCameras.map((camera) => <article
                      key={camera.id}
                      ref={(element) => { cameraRefs.current[camera.id] = element }}
                      className={camera.id === selectedId ? 'camera-catalog-item active' : 'camera-catalog-item'}
                      role="button"
                      tabIndex={0}
                      aria-label={`选择摄像头 ${camera.name}`}
                      onClick={() => selectCamera(camera)}
                      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') selectCamera(camera) }}
                    >
                      <CameraViewport camera={camera} mode={mode} playing={camera.id === selectedId && playing} primary={camera.id === selectedId} onReconnect={() => setFeedback(`正在重新连接 ${camera.name}`)} />
                      <div className="camera-tile-meta"><span>{camera.area}</span><strong>{camera.model}</strong><small>{camera.ip}</small></div>
                    </article>)}
                  </div>
                </section>
              })}
              {filteredCameras.length === 0 && <div className="catalog-empty"><Search size={22} /><strong>没有匹配的摄像头</strong><span>请调整搜索关键词或状态筛选</span></div>}
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
                <button title="抓拍" onClick={() => setFeedback('抓拍任务已完成')}><CameraIcon size={17} /></button>
                <button title="下载录像" onClick={() => setFeedback('已创建录像下载任务')}><Download size={17} /></button>
                <button title="全屏" onClick={() => void enterFullscreen()}><Expand size={17} /></button>
              </div>
            </div>
          </article>

          {mode === 'replay' && <article className="replay-panel panel">
            <div className="replay-query">
              <label><CalendarDays size={15} /><span>录像日期</span><input type="date" value={replayDate} onChange={(event) => setReplayDate(event.target.value)} /></label>
              <label><Clock3 size={15} /><span>录像类型</span><select value={recordingType} onChange={(event) => { setRecordingType(event.target.value); setSelectedSegment(0) }}><option value="all">全部录像</option><option>定时录像</option><option>移动侦测</option><option>事件录像</option></select></label>
              <button className="primary-button" onClick={() => setFeedback(`已查询 ${replayDate} 的${visibleRecordingSegments.length}段录像`)}><Search size={15} />查询录像</button>
            </div>
            <div className="timeline-ruler"><span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>24:00</span></div>
            <div className="recording-track">
              {visibleRecordingSegments.map((segment, index) => <button key={`${segment.start}-${segment.end}`} onClick={() => setSelectedSegment(index)} className={`${segment.color} ${selectedSegment === index ? 'active' : ''}`} style={{ flex: segment.type === '定时录像' ? 1 : .18 }} title={`${segment.type} ${segment.start}-${segment.end}`} />)}
              <i style={{ left: '44%' }} />
            </div>
            <div className="segment-list">
              {visibleRecordingSegments.slice(0, 4).map((segment, index) => <button key={segment.start} onClick={() => setSelectedSegment(index)} className={selectedSegment === index ? 'active' : ''}><span className={segment.color} /><strong>{segment.start}—{segment.end}</strong><small>{segment.type}</small><Play size={13} /></button>)}
            </div>
          </article>}

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
        <p>{camera.status === 'online' ? '当前媒体通道未启用，请在后台配置中心启用对应资源通道' : `设备${statusText[camera.status]}，正在等待网络恢复`}</p>
        {primary && <button onClick={onReconnect}><RefreshCw size={14} />重新连接</button>}
      </div>}
      <div className="viewport-label"><i className={camera.status} /><span>{camera.name}</span><small>{camera.area}</small></div>
    </div>
  )
}
