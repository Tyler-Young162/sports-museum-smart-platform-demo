import fieldData from '../../config/field-data.json'

export type VlanSegment = {
  id: string
  businessType: string
  project: string
  networkSegments: string[]
  gateway: string
  vlanIds: string[]
  ipDevices: number | null
  externalNeeds: number | null
  remark: string
}

export type VlanAllocation = {
  id: string
  zone: string
  assetType: string
  range: string
  usedIPs: number | null
  reservedIPs: number | null
  remark: string
}

export const vlanSegments: VlanSegment[] = fieldData.vlanSegments
export const vlanAllocations: VlanAllocation[] = fieldData.vlanAllocations
