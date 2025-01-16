import { useDefaultProps, useStore } from '@builder.io/mitosis';
import { DefaultPropsState, DefaultPropsType } from './types';

useDefaultProps<DefaultPropsType>({ foo: 'abc', bar: 'foo' });

export default function DefaultProps(props: DefaultPropsType) {
  const state = useStore<DefaultPropsState>({
    getProps: () => {
      return JSON.stringify({ foo: props.foo, bar: props.bar });
    },
  });

  return <div data-testid="default-props">{state.getProps()}</div>;
}
