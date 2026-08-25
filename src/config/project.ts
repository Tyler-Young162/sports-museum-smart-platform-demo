import projectData from '../../config/project.json'

export const projectConfig = projectData

export type ModuleConfig = {
  key: string
  label: string
  path: string
  description: string
}

export const moduleConfig: ModuleConfig[] = [
  { key: 'dashboard', label: '综合态势', path: '/', description: '场馆运行总览与今日态势' },
  { key: 'alarms', label: '告警中心', path: '/alarms', description: '设备与馆内事件告警闭环处置' },
  { key: 'video', label: '视频监控', path: '/video', description: '摄像头实况与录像回放模拟' },
  { key: 'access', label: '人员通行', path: '/access', description: '人员、访客、门禁与车辆通行' },
  { key: 'publishing', label: '信息发布', path: '/publishing', description: '屏幕、素材、节目单与发布任务' },
  { key: 'workorders', label: '工单管理', path: '/workorders', description: '维修、巡检与事件工单流转' },
  { key: 'map', label: '电子地图', path: '/map', description: '场馆地图、设备点位与事件定位' },
  { key: 'environment', label: '机房动环', path: '/environment', description: '环境传感、UPS与运行趋势' },
  { key: 'audio', label: '背景音乐', path: '/audio', description: '广播分区、播放任务与设备状态' },
  { key: 'network', label: '无线网络', path: '/network', description: 'AP、终端、流量与网络告警' },
  { key: 'interfaces', label: '接口管理', path: '/interfaces', description: 'SDK、协议及系统适配状态' },
  { key: 'demo', label: '演示控制台', path: '/demo', description: '稳定触发与重置模拟演示场景' },
]
