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

export const stageLightingPages: StageLightingPage[] = [
  {
    id: 'LIGHT-PAGE-0',
    pageLabel: '灯具页0',
    fixtureType: '光束灯',
    startAddress: '001',
    stepRule: '每个加16',
    note: '摇头灯地址从 001 开始，按 16 通道递增。',
  },
  {
    id: 'LIGHT-PAGE-1',
    pageLabel: '灯具页1',
    fixtureType: '帕灯',
    startAddress: '100',
    stepRule: '每个加7',
    note: '帕灯地址从 100 开始，按 7 通道递增。',
  },
  {
    id: 'LIGHT-PAGE-2',
    pageLabel: '灯具页2',
    fixtureType: '平板灯',
    startAddress: '200',
    stepRule: '每个加6',
    note: '平板灯地址从 200 开始，按 6 通道递增。',
  },
  {
    id: 'LIGHT-PAGE-4',
    pageLabel: '灯具页4',
    fixtureType: '面光灯',
    startAddress: '270',
    stepRule: '每个加6',
    note: '面光灯地址从 270 开始，按 6 通道递增。',
  },
]

export const stageLightingControlLoops: StageLightingLoop[] = [
  { id: 'CTRL-1', groupLabel: '1组', description: '舞台右边帕灯' },
  { id: 'CTRL-2', groupLabel: '2组', description: '舞台左边摇头灯' },
  { id: 'CTRL-3', groupLabel: '3组', description: '舞台右边摇头灯' },
  { id: 'CTRL-4', groupLabel: '4组', description: '舞台左边帕灯' },
  { id: 'CTRL-5', groupLabel: '5组', description: '舞台前平板灯' },
  { id: 'CTRL-6', groupLabel: '6组', description: '舞台前帕灯' },
  { id: 'CTRL-7', groupLabel: '7组', description: '观众席面光灯' },
]

export const stageLightingPowerLoops: StageLightingLoop[] = [
  { id: 'POWER-TBD', groupLabel: '待补充', description: '原始 CSV 仅给出“电源线回路”标题，未列出具体回路内容。' },
]
