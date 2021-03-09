import { JSXLiteConfig } from 'src/types/jsx-lite-config'

export function getJsxLiteConfig(): JSXLiteConfig | null {
  const module = require(process.cwd() + '/jsx-lite.config')
  return module?.default || module || null
}
