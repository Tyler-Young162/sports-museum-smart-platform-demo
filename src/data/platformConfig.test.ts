import { describe, expect, it } from 'vitest'
import platform from '../../config/platform.json'
import project from '../../config/project.json'
import cameras from '../../public/config/cameras.json'
import backend from '../../config/backend.json'
import publicPortal from '../../config/public.json'
import fieldData from '../../config/field-data.json'

describe('平台配置边界', () => {
  it('内部数据模式保持隔离且接口不冒充已完成真实联调', () => {
    expect(project.dataMode).toBe('mock')
    for (const item of platform.systemInterfaces) {
      expect(item.adapter).toMatch(/IntegrationAdapter$/)
      expect(item.status).toBe('配置就绪')
      expect(item.vendor).toBe('待客户确认')
    }
  })

  it('所有模块都提供完整的业务记录', () => {
    const collections = [
      platform.initialAlarms, platform.initialWorkOrders, platform.accessRecords,
      platform.personnel, platform.visitors, platform.vehicles, platform.displayScreens,
      platform.publishingTasks, platform.mapNodes, platform.sensors, platform.upsDevices,
      platform.audioZones, platform.accessPoints, platform.systemInterfaces, platform.demoScenarios,
    ]
    expect(collections.every((items) => items.length > 0)).toBe(true)
    expect(platform.dashboard.overviewStats.length).toBeGreaterThan(0)
    expect(platform.dashboard.systemStatus.length).toBeGreaterThan(0)
    expect(cameras.cameras.length).toBeGreaterThan(0)
  })

  it('地图点位为可替换的相对坐标', () => {
    for (const node of platform.mapNodes) {
      expect(node.x).toBeGreaterThanOrEqual(0)
      expect(node.x).toBeLessThanOrEqual(100)
      expect(node.y).toBeGreaterThanOrEqual(0)
      expect(node.y).toBeLessThanOrEqual(100)
    }
  })

  it('关键业务编号在各自集合内唯一', () => {
    const collections = [
      platform.initialAlarms, platform.initialWorkOrders, platform.accessRecords,
      platform.visitors, platform.vehicles, platform.displayScreens, platform.mapNodes,
      platform.sensors, platform.upsDevices, platform.accessPoints, platform.systemInterfaces,
    ]
    for (const items of collections) {
      const ids = items.map((item) => item.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('双入口都具备可配置内容', () => {
    expect(publicPortal.exhibitions.length).toBeGreaterThan(0)
    expect(backend.frontendChannels.some((item) => item.route === '/portal')).toBe(true)
    expect(backend.frontendChannels.some((item) => item.route === '/')).toBe(true)
  })

  it('技术后台清单完整且保持接入边界', () => {
    expect(backend.deviceAssets.length).toBeGreaterThan(0)
    expect(backend.externalApplications.length).toBeGreaterThan(0)
    expect(backend.apiEndpoints.length).toBeGreaterThan(0)
    for (const item of backend.hardwareGateways) expect(item.adapter).toMatch(/IntegrationAdapter$/)
  })

  it('现场脱敏配置已加载且数量口径一致', () => {
    expect(cameras.cameras).toHaveLength(112)
    expect(platform.accessPoints).toHaveLength(42)
    expect(backend.deviceAssets.filter((item) => item.category === '人员通行')).toHaveLength(150)
    expect(fieldData.vlanSegments.length).toBeGreaterThan(0)
    expect(fieldData.stageLightingPages.length).toBeGreaterThan(0)
    expect(platform.systemInterfaces.find((item) => item.id === 'IF-VIDEO')?.devices).toBe(`${cameras.cameras.length}路现场摄像头`)
  })
})
