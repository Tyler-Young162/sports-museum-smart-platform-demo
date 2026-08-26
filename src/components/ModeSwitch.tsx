import { MonitorPlay, Settings2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function ModeSwitch({ mode }: { mode: 'public' | 'admin' }) {
  const navigate = useNavigate()
  return <div className="mode-switch" aria-label="系统入口切换">
    <button className={mode === 'public' ? 'active' : ''} onClick={() => navigate('/portal')}><MonitorPlay size={14}/>公众展示</button>
    <button className={mode === 'admin' ? 'active' : ''} onClick={() => navigate('/')}><Settings2 size={14}/>管理与技术</button>
  </div>
}
