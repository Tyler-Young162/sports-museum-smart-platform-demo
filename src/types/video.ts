export type CameraStatus = 'online' | 'offline' | 'fault'

export type FloorConfig = {
  id: string
  name: string
  areas: string[]
}

export type Camera = {
  id: string
  name: string
  floorId: string
  area: string
  position: string
  status: CameraStatus
  channel: string
  ip: string
  model: string
  resolution: string
  recordingDays: number
  videoUrl: string | null
  lastOnline: string
}

export type CameraConfig = {
  updatedAt: string
  floors: FloorConfig[]
  cameras: Camera[]
}
