import type { CameraConfig } from '../types/video'

export async function loadCameraConfig(): Promise<CameraConfig> {
  const response = await fetch('/config/cameras.json', { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`摄像头配置加载失败：${response.status}`)
  }
  return response.json() as Promise<CameraConfig>
}
