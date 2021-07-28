import * as targets from '../targets'
export type Targets = typeof targets
export type Target = keyof Targets

type FileInfo = {
  path: string
  content: string
  target: string
}

export type MitosisConfig = {
  type?: 'library' // Only one type right now
  targets: Target[]
  dest?: string
  files?: string | string[]
  mapFile?: (info: FileInfo) => FileInfo | Promise<FileInfo>
}
