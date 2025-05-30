import { filesystem, system } from 'gluegun';

export const cli = async (cmd: string) => {
  const root = filesystem.path(__dirname, '..', '..');
  const mitosisCliScript = filesystem.path(root, 'bin', 'mitosis');
  const shcmd = `node "${mitosisCliScript}" ${cmd}`;
  console.debug(`Running: ${shcmd}`);
  return system.run(shcmd);
};

export const DEFAULT_TEST_TIMEOUT = 20000;
