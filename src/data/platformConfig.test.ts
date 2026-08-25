import { describe, expect, it } from 'vitest'
import platform from '../../config/platform.json'
import project from '../../config/project.json'
import cameras from '../../public/config/cameras.json'

describe('Demo 配置边界', () => {
  it('第一阶段保持 mock 模式且接口不冒充真实联调', () => {
    expect(project.dataMode).toBe('mock')
    for (const item of platform.systemInterfaces) {
      expect(item.adapter).toMatch(/^Mock/)
      expect(item.status).toBe('模拟运行')
      expect(item.vendor).toBe('待客户确认')
    }
  })

  it('所有模块都提供可演示的模拟记录', () => {
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
})
