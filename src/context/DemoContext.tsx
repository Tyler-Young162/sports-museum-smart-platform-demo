import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { initialAlarms, initialWorkOrders, type AlarmRecord, type WorkOrderRecord } from '../data/platformMock'

type DemoContextValue = {
  alarms: AlarmRecord[]
  workOrders: WorkOrderRecord[]
  scenarioMessage: string
  acknowledgeAlarm: (id: string) => void
  dispatchAlarm: (id: string) => void
  closeAlarm: (id: string) => void
  advanceWorkOrder: (id: string) => void
  triggerScenario: (id: string) => void
  resetDemo: () => void
  clearScenarioMessage: () => void
}

const DemoContext = createContext<DemoContextValue | null>(null)

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [alarms, setAlarms] = useState<AlarmRecord[]>(() => readStored('smart-venue-alarms', initialAlarms))
  const [workOrders, setWorkOrders] = useState<WorkOrderRecord[]>(() => readStored('smart-venue-workorders', initialWorkOrders))
  const [scenarioMessage, setScenarioMessage] = useState('')

  useEffect(() => window.localStorage.setItem('smart-venue-alarms', JSON.stringify(alarms)), [alarms])
  useEffect(() => window.localStorage.setItem('smart-venue-workorders', JSON.stringify(workOrders)), [workOrders])

  function acknowledgeAlarm(id: string) {
    setAlarms((items) => items.map((alarm) => alarm.id === id ? { ...alarm, status: '处理中', timeline: [...alarm.timeline, { time: '刚刚', title: '告警已确认', detail: '当前管理员确认并开始处理' }] } : alarm))
    setScenarioMessage('告警已确认，处理动态已更新')
  }

  function dispatchAlarm(id: string) {
    const alarm = alarms.find((item) => item.id === id)
    if (!alarm) return
    const existing = workOrders.find((item) => item.source.includes(id))
    if (existing) {
      setScenarioMessage(`该告警已关联工单 ${existing.id}`)
      return
    }
    const workOrderId = `WO20260824${String(workOrders.length + 19).padStart(4, '0')}`
    setWorkOrders((items) => [{ id: workOrderId, title: `处置：${alarm.title}`, type: '告警处置', priority: alarm.level === '严重' ? '紧急' : '高', department: alarm.source.includes('视频') ? '安保部' : '设施运维部', assignee: '待分配', location: alarm.location, status: '待分配', createdAt: '2026-08-24 10:48', dueAt: '2026-08-24 12:48', progress: 5, source: `告警${alarm.id}` }, ...items])
    setAlarms((items) => items.map((item) => item.id === id ? { ...item, status: '处理中', relatedWorkOrder: workOrderId, timeline: [...item.timeline, { time: '刚刚', title: '已转为工单', detail: `工单${workOrderId}已创建` }] } : item))
    setScenarioMessage(`工单 ${workOrderId} 已创建`)
  }

  function closeAlarm(id: string) {
    setAlarms((items) => items.map((alarm) => alarm.id === id ? { ...alarm, status: '已关闭', timeline: [...alarm.timeline, { time: '刚刚', title: '告警关闭', detail: '管理员确认现场已恢复正常' }] } : alarm))
    setScenarioMessage('告警已关闭')
  }

  function advanceWorkOrder(id: string) {
    const nextStatus: Record<WorkOrderRecord['status'], WorkOrderRecord['status']> = { '待分配': '处理中', '处理中': '待验收', '待验收': '已完成', '已完成': '已完成' }
    const nextProgress: Record<WorkOrderRecord['status'], number> = { '待分配': 30, '处理中': 85, '待验收': 100, '已完成': 100 }
    setWorkOrders((items) => items.map((item) => item.id === id ? { ...item, status: nextStatus[item.status], assignee: item.assignee === '待分配' ? '张伟' : item.assignee, progress: nextProgress[item.status] } : item))
    setScenarioMessage('工单状态已流转到下一节点')
  }

  function triggerScenario(id: string) {
    const messages: Record<string, string> = {
      'camera-offline': '已触发“摄像头离线”场景，请前往告警中心查看',
      'temperature-high': '已触发“机房温度升高”场景，请前往动环或告警中心查看',
      'visitor-entry': '已启动访客预约入场场景',
      'screen-publish': '已启动信息发布场景',
      'ups-battery': '已触发UPS电池供电场景',
    }
    const alarmIdByScenario: Record<string, string> = {
      'camera-offline': 'AL202608240031',
      'temperature-high': 'AL202608240030',
      'ups-battery': 'AL202608240027',
    }
    const targetAlarmId = alarmIdByScenario[id]
    if (targetAlarmId) {
      setAlarms((items) => items.map((alarm) => {
        if (alarm.id !== targetAlarmId) return alarm
        const { relatedWorkOrder: _relatedWorkOrder, ...rest } = alarm
        return { ...rest, status: '待确认', timeline: [...alarm.timeline, { time: '刚刚', title: '验证场景触发', detail: '场景控制台重新触发该测试事件' }] }
      }))
      setWorkOrders((items) => items.filter((item) => !item.source.includes(targetAlarmId)))
    }
    setScenarioMessage(messages[id] ?? '验证场景已启动')
  }

  function resetDemo() {
    setAlarms(initialAlarms)
    setWorkOrders(initialWorkOrders)
    setScenarioMessage('全部场景数据已恢复到初始状态')
  }

  const value = useMemo(() => ({ alarms, workOrders, scenarioMessage, acknowledgeAlarm, dispatchAlarm, closeAlarm, advanceWorkOrder, triggerScenario, resetDemo, clearScenarioMessage: () => setScenarioMessage('') }), [alarms, workOrders, scenarioMessage])
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo() {
  const value = useContext(DemoContext)
  if (!value) throw new Error('useDemo must be used within DemoProvider')
  return value
}
