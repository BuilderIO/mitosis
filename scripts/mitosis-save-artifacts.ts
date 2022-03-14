import { execa } from 'execa';

const token = process.env.API_TOKEN_GITHUB;
const repo = `https://${token}:x-oauth-basic@github.com/BuilderIO/mitosis-build.git`;
const srcRepoRef = 'https://github.com/BuilderIO/mitosis/commit/';
const root = __dirname + '/..';
const packages_core = root + '/packages/core';
const mitosis_build_artifacts = packages_core + '/mitosis-build';
const buildFiles = ['CHANGELOG.md', 'package.json', 'README.md', 'dist'];

(async () => {
  await $('rm', '-rf', mitosis_build_artifacts);
  const SHA = await $('git', 'rev-parse', 'HEAD');
  process.chdir(`${root}/packages/core`);
  await $('git', 'clone', repo);
  const branch = await $('git', 'branch', '--show-current');
  const msg = await $('git', 'log', '--oneline', '-1', '--no-decorate');
  const userName = await $('git', 'log', '-1', "--pretty=format:'%an'");
  const userEmail = await $('git', 'log', '-1', "--pretty=format:'%ae'");

  process.chdir(`${mitosis_build_artifacts}`);
  try {
    await $('git', 'checkout', branch);
  } catch (e) {
    await $('git', 'checkout', '-b', branch);
  }
  await $('rm', '-rf', ...(await expand(mitosis_build_artifacts)));
  process.chdir(`${packages_core}`);
  await $('cp', '-r', ...buildFiles, mitosis_build_artifacts);
  process.chdir(`${mitosis_build_artifacts}`);
  await $('git', 'add', '--all');
  await $(
    'git',
    '-c',
    `user.name=${userName}`,
    '-c',
    `user.email=${userEmail}`,
    'commit',
    '--allow-empty',
    '-m',
    msg + '\n\n' + srcRepoRef + SHA,
  );
  const dstSHA = await $('git', 'rev-parse', 'HEAD');
  console.log('##############################################################');
  console.log('##############################################################');
  console.log(
    `### https://github.com/BuilderIO/mitosis-build/commit/${dstSHA}`,
  );
  console.log('##############################################################');
  console.log('##############################################################');
  await $('git', 'push', repo, `HEAD:${branch}`);
  await $('rm', '-rf', mitosis_build_artifacts);
})();

async function $(cmd: string, ...args: string[]): Promise<string> {
  console.log('EXEC:', cmd, ...args);
  const { stdout } = await execa(cmd, args);
  const output = String(stdout).trim();
  console.log('     ', output);
  return output;
}

async function expand(path: string): Promise<string[]> {
  const { stdout } = await execa('ls', [path]);
  const paths = String(stdout)
    .split('\n')
    .map((file) => path + '/' + file.trim());
  return paths;
}
