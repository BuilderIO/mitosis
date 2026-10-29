import { componentToReactNative } from '@/generators/react-native';
import { parseJsx } from '@/parsers/jsx';
import { MitosisComponent } from '@/types/mitosis-component';
import { MitosisPlugin } from '@/types/plugins';
import { runPostJsonPlugins, runPreJsonPlugins } from './plugins';

const getComponent = () =>
  parseJsx(`
    export default function MyComponent(props) {
      return <div>Hello</div>;
    }
  `);

const renamePlugin =
  (hook: 'pre' | 'post'): MitosisPlugin =>
  () => ({
    json: {
      [hook]: (json: MitosisComponent) => ({ ...json, name: 'Renamed' }),
    },
  });

const noopPlugin =
  (hook: 'pre' | 'post'): MitosisPlugin =>
  () => ({
    json: {
      [hook]: () => {},
    },
  });

describe('json plugins', () => {
  test('runPreJsonPlugins passes the result of each plugin to the next one', () => {
    let receivedName: string | undefined;
    const json = runPreJsonPlugins({
      json: getComponent(),
      plugins: [
        renamePlugin('pre'),
        () => ({
          json: {
            pre: (json: MitosisComponent) => {
              receivedName = json.name;
            },
          },
        }),
      ],
    });
    expect(receivedName).toBe('Renamed');
    expect(json.name).toBe('Renamed');
  });

  test('runPostJsonPlugins passes the result of each plugin to the next one', () => {
    let receivedName: string | undefined;
    const json = runPostJsonPlugins({
      json: getComponent(),
      plugins: [
        renamePlugin('post'),
        () => ({
          json: {
            post: (json: MitosisComponent) => {
              receivedName = json.name;
            },
          },
        }),
      ],
    });
    expect(receivedName).toBe('Renamed');
    expect(json.name).toBe('Renamed');
  });

  test('keeps the returned component when a later plugin returns nothing', () => {
    expect(
      runPreJsonPlugins({
        json: getComponent(),
        plugins: [renamePlugin('pre'), noopPlugin('pre')],
      }).name,
    ).toBe('Renamed');
    expect(
      runPostJsonPlugins({
        json: getComponent(),
        plugins: [renamePlugin('post'), noopPlugin('post')],
      }).name,
    ).toBe('Renamed');
  });

  test('React Native keeps the component returned by a user json plugin', () => {
    const output = componentToReactNative({ plugins: [renamePlugin('pre')] })({
      component: getComponent(),
    });
    expect(output).toContain('function Renamed(');
  });
});
