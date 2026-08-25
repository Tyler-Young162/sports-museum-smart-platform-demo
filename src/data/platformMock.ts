import platformConfig from '../../config/platform.json'

export type AlarmLevel = '严重' | '一般' | '提示'
export type AlarmStatus = '待确认' | '处理中' | '已关闭'

export type AlarmRecord = {
  id: string
  title: string
  level: AlarmLevel
  type: string
  source: string
  location: string
  device: string
  time: string
  status: AlarmStatus
  description: string
  relatedWorkOrder?: string
  timeline: { time: string; title: string; detail: string }[]
}

export type WorkOrderRecord = {
  id: string
  title: string
  type: string
  priority: '紧急' | '高' | '普通'
  department: string
  assignee: string
  location: string
  status: '待分配' | '处理中' | '待验收' | '已完成'
  createdAt: string
  dueAt: string
  progress: number
  source: string
}

type PlatformConfig = Omit<typeof platformConfig, 'initialAlarms' | 'initialWorkOrders'> & {
  initialAlarms: AlarmRecord[]
  initialWorkOrders: WorkOrderRecord[]
}

const data = platformConfig as unknown as PlatformConfig

export const initialAlarms = data.initialAlarms
export const initialWorkOrders = data.initialWorkOrders
export const accessRecords = data.accessRecords
export const personnel = data.personnel
export const visitors = data.visitors
export const vehicles = data.vehicles
export const displayScreens = data.displayScreens
export const publishingTasks = data.publishingTasks
export const mapNodes = data.mapNodes
export const sensors = data.sensors
export const upsDevices = data.upsDevices
export const audioZones = data.audioZones
export const accessPoints = data.accessPoints
export const systemInterfaces = data.systemInterfaces
export const demoScenarios = data.demoScenarios
