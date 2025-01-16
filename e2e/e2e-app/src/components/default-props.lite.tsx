import { useDefaultProps, useStore } from '@builder.io/mitosis';

type Props = {
  foo?: string;
  bar?: string;
};

type State = {
  getProps: () => string;
};

useDefaultProps<Props>({ foo: 'abc', bar: 'foo' });

export default function DefaultProps(props: Props) {
  const state = useStore<State>({
    getProps: () => {
      return JSON.stringify({ foo: props.foo, bar: props.bar });
    },
  });

  return <div data-testid="default-props">{state.getProps()}</div>;
}
