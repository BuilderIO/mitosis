import { system, filesystem } from 'gluegun'

const src = filesystem.path(__dirname, '..')

const script = filesystem.path(src, 'bin', 'jsx-lite')

const cli = async (cmd: string) => system.run(`node ${script} ${cmd}`)

test('outputs version', async () => {
  const output = await cli('--version')
  expect(output).toContain('0.0.1')
})

test('outputs help', async () => {
  const output = await cli('--help')
  expect(output).toContain('0.0.1')
})
