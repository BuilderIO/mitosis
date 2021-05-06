import { filesystem, system } from 'gluegun'

const { version } = require('../../package.json')

const root = filesystem.path(__dirname, '..', '..')
const script = filesystem.path(root, 'bin', 'jsx-lite')

const cli = async (cmd: string) => {
  const shcmd = `node ${script} ${cmd}`
  console.debug(`Running: ${shcmd}`)
  return system.run(shcmd)
}

test('outputs version', async () => {
  const output = await cli('--version')
  expect(output).toContain(version)
})

test('outputs help', async () => {
  const output = await cli('--help')
  expect(output).toContain(version)
})
