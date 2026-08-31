import fieldData from '../../config/field-data.json'

export type StageLightingPage = {
  id: string
  pageLabel: string
  fixtureType: string
  startAddress: string
  stepRule: string
  note: string
}

export type StageLightingLoop = {
  id: string
  groupLabel: string
  description: string
}

export const stageLightingPages: StageLightingPage[] = fieldData.stageLightingPages
export const stageLightingControlLoops: StageLightingLoop[] = fieldData.stageLightingControlLoops
export const stageLightingPowerLoops: StageLightingLoop[] = fieldData.stageLightingPowerLoops
