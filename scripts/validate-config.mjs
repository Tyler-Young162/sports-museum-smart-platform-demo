import { readFile } from 'node:fs/promises'

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'))
const project = await readJson('../config/project.json')
const platform = await readJson('../config/platform.json')
const backend = await readJson('../config/backend.json')
const publicPortal = await readJson('../config/public.json')
const cameras = await readJson('../public/config/cameras.json')

const errors = []
const requiredCollections = [
  'initialAlarms', 'initialWorkOrders', 'accessRecords', 'personnel', 'visitors',
  'vehicles', 'displayScreens', 'publishingTasks', 'mapNodes', 'sensors',
  'upsDevices', 'audioZones', 'accessPoints', 'systemInterfaces', 'demoScenarios',
]

if (project.dataMode !== 'mock') errors.push('config/project.json: 第一阶段 dataMode 必须为 mock')
for (const key of ['deviceAssets', 'hardwareGateways', 'externalApplications', 'frontendChannels', 'apiEndpoints', 'operationLogs']) {
  if (!Array.isArray(backend[key]) || backend[key].length === 0) errors.push(`config/backend.json: ${key} 必须是非空数组`)
  const ids = backend[key]?.map((item) => item.id).filter(Boolean) ?? []
  if (new Set(ids).size !== ids.length) errors.push(`config/backend.json: ${key} 存在重复 id`)
}
if (!publicPortal.hero || !Array.isArray(publicPortal.exhibitions) || !publicPortal.exhibitions.length) errors.push('config/public.json: 公众展示配置不完整')
for (const gateway of backend.hardwareGateways ?? []) {
  if (!String(gateway.adapter).startsWith('Mock') || !['模拟运行', '待配置', '已停用'].includes(gateway.status)) errors.push(`config/backend.json: ${gateway.id} 必须保持模拟适配器边界`)
}
if (!platform.dashboard || !Array.isArray(platform.dashboard.overviewStats) || platform.dashboard.overviewStats.length === 0) {
  errors.push('config/platform.json: dashboard 配置不完整')
}
for (const key of requiredCollections) {
  if (!Array.isArray(platform[key]) || platform[key].length === 0) errors.push(`config/platform.json: ${key} 必须是非空数组`)
}

for (const key of requiredCollections) {
  const ids = platform[key]?.map((item) => item.id).filter(Boolean) ?? []
  if (new Set(ids).size !== ids.length) errors.push(`config/platform.json: ${key} 存在重复 id`)
}

for (const node of platform.mapNodes ?? []) {
  if (typeof node.x !== 'number' || typeof node.y !== 'number' || node.x < 0 || node.x > 100 || node.y < 0 || node.y > 100) {
    errors.push(`config/platform.json: 地图节点 ${node.id} 的 x/y 必须为 0–100`)
  }
}

for (const item of platform.systemInterfaces ?? []) {
  if (!String(item.adapter).startsWith('Mock') || item.status !== '模拟运行') {
    errors.push(`config/platform.json: 接口 ${item.id} 第一阶段必须保持模拟适配器状态`)
  }
}

const cameraList = cameras.cameras ?? []
if (cameraList.length === 0) errors.push('public/config/cameras.json: cameras 必须是非空数组')
const cameraIds = cameraList.map((item) => item.id)
if (new Set(cameraIds).size !== cameraIds.length) errors.push('public/config/cameras.json: 摄像头 id 存在重复')

if (errors.length) {
  console.error(`配置校验失败（${errors.length}项）`)
  errors.forEach((message) => console.error(`- ${message}`))
  process.exit(1)
}

console.log(`配置校验通过：${cameraList.length}路摄像头、${platform.mapNodes.length}个地图节点、${backend.deviceAssets.length}项后台设备资产、${backend.externalApplications.length}个外部应用`)
