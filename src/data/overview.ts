import platform from '../../config/platform.json'

export const dashboardConfig = platform.dashboard
export const overviewStats = platform.dashboard.overviewStats
export const trendData = platform.dashboard.trendData
export const recentAlarms = platform.initialAlarms.slice(0, 4).map((alarm) => ({
  id: alarm.id,
  level: alarm.level,
  title: alarm.title,
  location: alarm.location,
  time: alarm.time.slice(11, 16),
  status: alarm.status,
}))
