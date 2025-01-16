import { useDefaultProps, useStore } from '@builder.io/mitosis';

useDefaultProps({ foo: 'abc', bar: 'foo' });

export default function DefaultProps(props: any) {
  const state = useStore({
    getProps: () => {
      return JSON.stringify({ foo: props.foo, bar: props.bar });
    },
  });

  return <div data-testid="default-props">{state.getProps()}</div>;
}
