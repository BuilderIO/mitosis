import { setContext, useContext } from '@builder.io/mitosis';
import Context1 from '@dummy/1';
import Context2 from '@dummy/2';
import ReactiveContext1 from '@dummy/3';
import ReactiveContext2 from '@dummy/4';
import ReactiveProxyContext1 from '@dummy/5';
import ReactiveProxyContext2 from '@dummy/6';
import { useContext, setContext, useMetadata } from '@builder.io/mitosis';

useMetadata({
  context: {
    ReactiveContext1: 'reactive',
    ReactiveContext2: 'reactive',
    ReactiveProxyContext1: 'reactive-proxy',
    ReactiveProxyContext2: 'reactive-proxy',
  },
});

export default function ComponentWithContext(props: { content: string }) {
  const foo = useContext(Context1);
  const foo2 = useContext(ReactiveContext1);
  const foo3 = useContext(ReactiveProxyContext1);

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

  setContext(ReactiveProxyContext1, {
    foo: 'bar',
    content() {
      return props.content;
    },
  });

  return (
    <Context2.Provider value={{ bar: 'baz' }}>
      <ReactiveProxyContext2.Provider value={{ bar: 'baz' }}>
        <ReactiveContext2.Provider value={{ bar: 'baz' }}>
          <>{foo.value}</>
          <>{foo2.value}</>
          <>{foo3.value}</>
        </ReactiveContext2.Provider>
      </ReactiveProxyContext2.Provider>
    </Context2.Provider>
  );
}
