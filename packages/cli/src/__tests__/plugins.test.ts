import { describe, test, expect } from 'vitest';
import { MitosisConfig } from '@builder.io/mitosis';
import { formatHook, runHook } from '../build/build';

const beforeBuild = (c) => {
  console.log(`beforeBuild ${c}`);
};
const afterbuild = (c, f) => {
  console.log(`afterbuild ${c} ${f}`);
};
const beforeBuildSecond = (c) => {
  console.log(`beforeBuildSecond ${c}`);
};
const afterbuildSecond = (c, f) => {
  console.log(f);
  console.log(`afterbuildSecond ${c} ${f}`);
};

const objPluginConfig = {
  plugins: {
    order: 1,
    beforeBuild,
    afterbuild,
  },
};
const fnPluginConfig = {
  plugins: () => ({
    order: 1,
    beforeBuild,
    afterbuild,
  }),
};
const mixPluginConfig = {
  plugins: [
    () => ({
      name: 'second',
      order: 2,
      beforeBuild: beforeBuildSecond,
      afterbuild: afterbuildSecond,
    }),
    {
      name: 'first',
      order: 1,
      beforeBuild,
      afterbuild,
    },
  ],
};

describe('mitosis plugin test', () => {
  test('formatHook test objPlugin', () => {
    const plugins = formatHook(objPluginConfig as MitosisConfig);
    expect(plugins).toEqual([
      {
        order: 1,
        beforeBuild,
        afterbuild,
      },
    ]);
  });
  test('formatHook test fnPlugin', () => {
    const plugins = formatHook(fnPluginConfig as MitosisConfig);
    expect(plugins).toEqual([
      {
        order: 1,
        beforeBuild,
        afterbuild,
      },
    ]);
  });
  test('formatHook test mixPlugin', () => {
    const plugins = formatHook(mixPluginConfig as MitosisConfig);
    expect(plugins).toEqual([
      {
        name: 'first',
        order: 1,
        beforeBuild,
        afterbuild,
      },
      {
        name: 'second',
        order: 2,
        beforeBuild: beforeBuildSecond,
        afterbuild: afterbuildSecond,
      },
    ]);
    expect(plugins).not.toEqual([
      {
        name: 'second',
        order: 2,
        beforeBuild: beforeBuildSecond,
        afterbuild: afterbuildSecond,
      },
      {
        name: 'first',
        order: 1,
        beforeBuild,
        afterbuild,
      },
    ]);
  });
  test('runHook test', async () => {
    const _log = console.log;
    const logs = [];
    console.log = (str) => {
      logs.push(str);
    };
    const c = { test: 1 };
    const f = { test: 2 };
    const plugins = formatHook(mixPluginConfig as MitosisConfig);
    await runHook('beforeBuild', { plugins } as MitosisConfig)(c);
    expect(logs).toEqual([`beforeBuild ${c}`, `beforeBuildSecond ${c}`]);
    await runHook('afterbuild', { plugins } as MitosisConfig)(c, f);

    expect(logs).toEqual([
      `beforeBuild ${c}`,
      `beforeBuildSecond ${c}`,
      `afterbuild ${c} ${f}`,
      f,
      `afterbuildSecond ${c} ${f}`,
    ]);
    console.log = _log;
  });
});
