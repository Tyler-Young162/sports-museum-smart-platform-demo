import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import backendConfig from '../../config/backend.json'

export type DeviceAsset = (typeof backendConfig.deviceAssets)[number]
export type HardwareGateway = (typeof backendConfig.hardwareGateways)[number]
export type ExternalApplication = (typeof backendConfig.externalApplications)[number]
export type FrontendChannel = (typeof backendConfig.frontendChannels)[number]
export type ApiEndpoint = (typeof backendConfig.apiEndpoints)[number]
export type OperationLog = (typeof backendConfig.operationLogs)[number]

type BackendContextValue = {
  devices: DeviceAsset[]
  gateways: HardwareGateway[]
  applications: ExternalApplication[]
  channels: FrontendChannel[]
  apiEndpoints: ApiEndpoint[]
  logs: OperationLog[]
  addDevice: (item: DeviceAsset) => void
  updateDevice: (item: DeviceAsset) => void
  deleteDevice: (id: string) => void
  updateGateway: (item: HardwareGateway) => void
  testGateway: (id: string) => void
  addApplication: (item: ExternalApplication) => void
  updateApplication: (item: ExternalApplication) => void
  deleteApplication: (id: string) => void
  updateChannel: (item: FrontendChannel) => void
  resetBackend: () => void
}

const BackendContext = createContext<BackendContextValue | null>(null)

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

export function BackendProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<DeviceAsset[]>(() => readStored('smart-venue-backend-devices', backendConfig.deviceAssets))
  const [gateways, setGateways] = useState<HardwareGateway[]>(() => readStored('smart-venue-backend-gateways', backendConfig.hardwareGateways))
  const [applications, setApplications] = useState<ExternalApplication[]>(() => readStored('smart-venue-backend-applications', backendConfig.externalApplications))
  const [channels, setChannels] = useState<FrontendChannel[]>(() => readStored('smart-venue-backend-channels', backendConfig.frontendChannels))
  const [logs, setLogs] = useState<OperationLog[]>(() => readStored('smart-venue-backend-logs', backendConfig.operationLogs))

  useEffect(() => window.localStorage.setItem('smart-venue-backend-devices', JSON.stringify(devices)), [devices])
  useEffect(() => window.localStorage.setItem('smart-venue-backend-gateways', JSON.stringify(gateways)), [gateways])
  useEffect(() => window.localStorage.setItem('smart-venue-backend-applications', JSON.stringify(applications)), [applications])
  useEffect(() => window.localStorage.setItem('smart-venue-backend-channels', JSON.stringify(channels)), [channels])
  useEffect(() => window.localStorage.setItem('smart-venue-backend-logs', JSON.stringify(logs)), [logs])

  function addLog(module: string, action: string, target: string, result = '成功') {
    const now = new Date()
    const time = now.toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-').replace(' ', ' ')
    setLogs((items) => [{ id: `LOG-${Date.now()}`, time, operator: '当前管理员', module, action, target, result }, ...items].slice(0, 100))
  }

  function addDevice(item: DeviceAsset) {
    setDevices((items) => [item, ...items])
    addLog('设备资产', '添加设备', item.id)
  }

  function updateDevice(item: DeviceAsset) {
    setDevices((items) => items.map((current) => current.id === item.id ? item : current))
    addLog('设备资产', '更新设备', item.id)
  }

  function deleteDevice(id: string) {
    setDevices((items) => items.filter((item) => item.id !== id))
    addLog('设备资产', '删除设备', id)
  }

  function updateGateway(item: HardwareGateway) {
    setGateways((items) => items.map((current) => current.id === item.id ? item : current))
    addLog('硬件接入', '保存协议配置', item.id)
  }

  function testGateway(id: string) {
    setGateways((items) => items.map((item) => item.id === id ? { ...item, status: '模拟运行', lastTest: '刚刚' } : item))
    addLog('硬件接入', '模拟测试连接', id)
  }

  function addApplication(item: ExternalApplication) {
    setApplications((items) => [item, ...items])
    addLog('外部系统', '添加应用', item.id)
  }

  function updateApplication(item: ExternalApplication) {
    setApplications((items) => items.map((current) => current.id === item.id ? item : current))
    addLog('外部系统', item.status === '已启用' ? '启用应用' : '停用应用', item.id)
  }

  function deleteApplication(id: string) {
    setApplications((items) => items.filter((item) => item.id !== id))
    addLog('外部系统', '删除应用', id)
  }

  function updateChannel(item: FrontendChannel) {
    setChannels((items) => items.map((current) => current.id === item.id ? item : current))
    addLog('展示端配置', '保存渠道配置', item.id)
  }

  function resetBackend() {
    setDevices(backendConfig.deviceAssets)
    setGateways(backendConfig.hardwareGateways)
    setApplications(backendConfig.externalApplications)
    setChannels(backendConfig.frontendChannels)
    setLogs(backendConfig.operationLogs)
  }

  const value = useMemo(() => ({ devices, gateways, applications, channels, apiEndpoints: backendConfig.apiEndpoints, logs, addDevice, updateDevice, deleteDevice, updateGateway, testGateway, addApplication, updateApplication, deleteApplication, updateChannel, resetBackend }), [devices, gateways, applications, channels, logs])
  return <BackendContext.Provider value={value}>{children}</BackendContext.Provider>
}

export function useBackend() {
  const value = useContext(BackendContext)
  if (!value) throw new Error('useBackend must be used within BackendProvider')
  return value
}
