import { setContext, useContext, useMetadata } from '@builder.io/mitosis';
import Context1 from '@dummy/1';
import Context2 from '@dummy/2';
import ReactiveContext1 from '@dummy/3';
import ReactiveContext2 from '@dummy/4';

useMetadata({
  context: {
    ReactiveContext1: 'reactive',
    ReactiveContext2: 'reactive',
  },
});

export default function ComponentWithContext(props: { content: string }) {
  const foo = useContext(Context1);
  const foo2 = useContext(ReactiveContext1);

  setContext(Context1, {
    foo: 'bar',
    content() {
      return props.content;
    },
  });

  setContext(ReactiveContext1, {
    foo: 'bar',
    content() {
      return props.content;
    },
  });

  return (
    <Context2.Provider value={{ bar: 'baz' }}>
      <ReactiveContext2.Provider value={{ bar: 'baz' }}>
        <>{foo.value}</>
        <>{foo2.value}</>
      </ReactiveContext2.Provider>
    </Context2.Provider>
  );
}
