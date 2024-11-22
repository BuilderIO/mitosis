import { componentToVue, MitosisPlugin, OutputFiles, TargetContext } from '@builder.io/mitosis';
import { describe, expect, test } from 'vitest';
import { runBuildPlugins, sortPlugins } from '../build/build';

const beforeBuild = (c) => {
  console.log(`beforeBuild ${JSON.stringify(c)}`);
};
const afterbuild = (c, f) => {
  console.log(`afterbuild ${JSON.stringify(c)} ${JSON.stringify(f)}`);
};
const beforeBuildSecond = (c) => {
  console.log(`beforeBuildSecond ${JSON.stringify(c)}`);
};
const afterbuildSecond = (c, f) => {
  console.log(`afterbuildSecond ${JSON.stringify(c)} ${JSON.stringify(f)}`);
};
const beforeBuildNo = (c) => {
  console.log(`beforeBuildNo ${JSON.stringify(c)}`);
};
const afterbuildNo = (c, f) => {
  console.log(`afterbuildNo ${JSON.stringify(c)} ${JSON.stringify(f)}`);
};

const testPlugins: MitosisPlugin[] = [
  () => ({
    name: 'no-order',
    build: {
      pre: beforeBuildNo,
      post: afterbuildNo,
    },
  }),
  () => ({
    name: 'second',
    order: 2,
    build: {
      pre: beforeBuildSecond,
      post: afterbuildSecond,
    },
  }),
  () => ({
    name: 'first',
    order: 1,
    build: {
      pre: beforeBuild,
      post: afterbuild,
    },
  }),
];

describe('mitosis plugin test', () => {
  test('formatHook test mixPlugin', () => {
    const plugins = sortPlugins([...testPlugins]).map((plugin) => plugin());
    expect(plugins).toEqual([
      {
        name: 'no-order',
        build: {
          pre: beforeBuildNo,
          post: afterbuildNo,
        },
      },
      {
        name: 'first',
        order: 1,
        build: {
          pre: beforeBuild,
          post: afterbuild,
        },
      },
      {
        name: 'second',
        order: 2,
        build: {
          pre: beforeBuildSecond,
          post: afterbuildSecond,
        },
      },
    ]);
  });
  test('runHook test', async () => {
    const _log = console.log;
    const logs = [];
    console.log = (str) => {
      logs.push(str);
    };
    const c: TargetContext = {
      target: 'vue',
      generator: () => componentToVue(),
      outputPath: '',
    };
    const f: {
      componentFiles: OutputFiles[];
      nonComponentFiles: OutputFiles[];
    } = {
      componentFiles: [{ outputDir: '', outputFilePath: '' }],
      nonComponentFiles: [{ outputDir: '', outputFilePath: '' }],
    };
    await runBuildPlugins('pre', testPlugins)(c as TargetContext);
    const preResult = [
      `beforeBuildNo {"target":"vue","outputPath":""}`,
      'beforeBuildSecond {"target":"vue","outputPath":""}',
      'beforeBuild {"target":"vue","outputPath":""}',
    ];
    expect(logs).toEqual(preResult);
    await runBuildPlugins('post', testPlugins)(c, f);

    expect(logs).toEqual([
      ...preResult,
      'afterbuildNo {"target":"vue","outputPath":""} {"componentFiles":[{"outputDir":"","outputFilePath":""}],"nonComponentFiles":[{"outputDir":"","outputFilePath":""}]}',
      'afterbuildSecond {"target":"vue","outputPath":""} {"componentFiles":[{"outputDir":"","outputFilePath":""}],"nonComponentFiles":[{"outputDir":"","outputFilePath":""}]}',
      'afterbuild {"target":"vue","outputPath":""} {"componentFiles":[{"outputDir":"","outputFilePath":""}],"nonComponentFiles":[{"outputDir":"","outputFilePath":""}]}',
    ]);
    console.log = _log;
  });
});
