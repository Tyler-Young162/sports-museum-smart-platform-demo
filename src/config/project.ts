import projectData from '../../config/project.json'

export const projectConfig = projectData

export type ModuleConfig = {
  key: string
  label: string
  heading: string
  eyebrow: string
  path: string
  description: string
}

export const moduleConfig: ModuleConfig[] = [
  { key: 'dashboard', label: '综合态势', heading: '综合运行态势', eyebrow: 'OPERATION OVERVIEW', path: '/', description: '场馆运行总览与今日态势' },
  { key: 'alarms', label: '告警中心', heading: '告警中心管理', eyebrow: 'ALARM OPERATION CENTER', path: '/alarms', description: '设备与馆内事件告警闭环处置' },
  { key: 'video', label: '视频监控', heading: '视频监控管理', eyebrow: 'VIDEO SURVEILLANCE', path: '/video', description: '摄像头实况、完整目录与录像回放' },
  { key: 'access', label: '人员通行', heading: '人员通行管理', eyebrow: 'ACCESS & VISITOR MANAGEMENT', path: '/access', description: '人员、访客、门禁、车辆和人车关联信息' },
  { key: 'publishing', label: '信息发布', heading: '信息发布管理', eyebrow: 'INFORMATION PUBLISHING', path: '/publishing', description: '屏幕、素材、节目单与发布任务' },
  { key: 'workorders', label: '工单管理', heading: '工单管理', eyebrow: 'WORK ORDER MANAGEMENT', path: '/workorders', description: '维修、巡检与事件工单流转' },
  { key: 'map', label: '电子地图', heading: '电子地图管理', eyebrow: 'GIS & DEVICE MAP', path: '/map', description: '场馆地图、设备点位与事件定位' },
  { key: 'environment', label: '机房动环', heading: '机房环境监测及控制', eyebrow: 'ENVIRONMENT & UPS', path: '/environment', description: '环境传感、UPS与运行趋势' },
  { key: 'audio', label: '背景音乐', heading: '背景音乐管理', eyebrow: 'BACKGROUND MUSIC', path: '/audio', description: '广播分区、播放任务与设备状态' },
  { key: 'network', label: '无线网络', heading: '无线网络管理', eyebrow: 'WIRELESS NETWORK', path: '/network', description: 'AP、终端、流量与网络告警' },
  { key: 'interfaces', label: '接口管理', heading: '接口管理', eyebrow: 'SYSTEM INTEGRATION', path: '/interfaces', description: 'SDK、协议及系统适配状态' },
  { key: 'backend', label: '技术后台', heading: '管理与技术后台', eyebrow: 'TECHNICAL ADMINISTRATION', path: '/backend', description: '设备、协议、外部系统和前端渠道配置' },
  { key: 'demo', label: '演示控制台', heading: '演示控制台', eyebrow: 'DEMO SCENARIO CONTROL', path: '/demo', description: '稳定触发、观察和重置模拟演示场景' },
]
