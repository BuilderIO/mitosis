import { filesystem, system } from 'gluegun'

const { version } = require('../package.json')

const root = filesystem.path(__dirname, '..')
const script = filesystem.path(root, 'bin', 'jsx-lite')

const cli = async (cmd: string) => system.run(`node ${script} ${cmd}`)

test('outputs version', async () => {
  const output = await cli('--version')
  expect(output).toContain(version)
})

test('outputs help', async () => {
  const output = await cli('--help')
  expect(output).toContain(version)
})
