import * as targets from '../targets'

type Targets = typeof targets
type Target = keyof Targets | 'webcomponents'

export type JSXLiteConfig = {
  type?: 'library' // Only one type right now
  targets: Target[]
  dest?: string
  files?: string | string[]
}
