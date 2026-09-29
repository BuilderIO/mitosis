import { componentToSvelte } from '@/generators/svelte';
import { parseJsx } from '@/parsers/jsx';
import { createRequire } from 'module';
import { compile } from 'svelte/compiler';

describe('Svelte memoizeGetters', () => {
  const component = parseJsx(`
    import { useStore } from '@builder.io/mitosis';

    export default function Counter(props) {
      const state = useStore({
        count: 2,
        get double() {
          globalThis.__doubleCalls = (globalThis.__doubleCalls || 0) + 1;
          return state.count * 2;
        },
        get label() {
          return 'x' + state.double;
        },
      });

      return (
        <div>
          <span>{state.double}</span>
          <span>{state.double}</span>
          <span>{state.label}</span>
        </div>
      );
    }
  `);

  const renderSsr = (code: string) => {
    const { js } = compile(code, { generate: 'ssr', format: 'cjs' });
    const module = { exports: {} as any };
    new Function('module', 'exports', 'require', js.code)(
      module,
      module.exports,
      createRequire(import.meta.url),
    );
    (globalThis as any).__doubleCalls = 0;
    const { html } = module.exports.default.render({});
    return { html, calls: (globalThis as any).__doubleCalls as number };
  };

  test('wraps getters in a memoized reactive declaration', () => {
    const output = componentToSvelte({ memoizeGetters: true })({ component });
    expect(output).toContain('$: double = __mitosisMemoizeGetter(() => {');
    expect(output).toContain('function __mitosisMemoizeGetter(fn)');
    expect(output).toContain('{double()}');
  });

  test('is off by default', () => {
    const output = componentToSvelte()({ component });
    expect(output).not.toContain('__mitosisMemoizeGetter');
    expect(output).toContain('$: double = () => {');
  });

  test('renders the same markup and evaluates each getter once per render', () => {
    const memoized = renderSsr(componentToSvelte({ memoizeGetters: true })({ component }));
    const plain = renderSsr(componentToSvelte()({ component }));

    expect(memoized.html).toBe(plain.html);
    expect(memoized.html).toContain('x4');
    expect(plain.calls).toBe(3);
    expect(memoized.calls).toBe(1);
  });

  test('adds types to the helper for TypeScript output', () => {
    const output = componentToSvelte({ memoizeGetters: true, typescript: true })({ component });
    expect(output).toContain('function __mitosisMemoizeGetter<T>(fn: () => T): () => T');
  });
});
