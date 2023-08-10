import { types } from '@babel/core';
import { capitalize } from '../capitalize';
import { replaceSignalSetters } from './process-signals';

describe(replaceSignalSetters.name, () => {
  test('should replace signal setters', () => {
    const code = `
    props.builderContextSignal.value.content = {
      ...builderContextSignal.content,
      ...newContent,
      data: {     
        ...builderContextSignal.content?.data, 
        ...newContent?.data },
        meta: {
          ...builderContextSignal.content?.meta,
          ...newContent?.meta,
          breakpoints:
          newContent?.meta?.breakpoints ||
          builderContextSignal.content?.meta?.breakpoints,
        }
        };
        
    builderContextSignal.value.rootState = newRootState;
    `;
    const propName = 'builderContextSignal';

    const output = replaceSignalSetters({
      code,
      nodeMaps: [
        {
          from: types.memberExpression(
            types.memberExpression(types.identifier('props'), types.identifier(propName)),
            types.identifier('value'),
          ),
          setTo: types.memberExpression(
            types.identifier('props'),
            types.identifier('set' + capitalize(propName)),
          ),
        },
        {
          from: types.memberExpression(types.identifier(propName), types.identifier('value')),
          setTo: types.identifier('set' + capitalize(propName)),
        },
      ],
    });
    expect(output).toMatchSnapshot();
  });
});
