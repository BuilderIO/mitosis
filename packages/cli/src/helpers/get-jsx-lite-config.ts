import { JSXLiteConfig } from 'src/types/mitosis-config'

export function getJsxLiteConfig(): JSXLiteConfig | null {
  const module = require(process.cwd() + '/mitosis.config')
  return module?.default || module || null
}
