// Mitosis doesn't yet generate the needed Angular module, so we have a module
// in the E2E host app. This code provides a list of components so that the same
// module can be used for multiple e2e cases with different components.

const fg = require('fast-glob');
const { writeFileSync } = require('fs');

const components = fg
  .sync(['lib/angular/src/components/**.ts'], { cwd: 'angular_src/app' })
  .map((p) => './' + p.slice(0, -3));

const output = `
// GENERATED FILE

${components.map((p, index) => `import Comp${index} from '${p}';`).join('\n')}

export const components = [${components.map((p, index) => 'Comp' + index).join(', ')}];
`;

writeFileSync('angular_src/app/mitosis-component-list.ts', output);

// mitosis-component-list;
