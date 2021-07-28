import * as targets from '../targets'

type Targets = typeof targets
type Target = keyof Targets | 'webcomponents' | 'qwik'

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
