import { setContext, useContext } from '@builder.io/mitosis';
import Context1 from '@dummy/1';
import Context2 from '@dummy/2';

export default function ComponentWithContext(props: { content: string }) {
  const foo = useContext(Context1);

  setContext(Context1, {
    foo: 'bar',
    content() {
      return props.content;
    },
  });

  return (
    <Context2.Provider value={{ bar: 'baz' }}>
      <>{foo.value}</>
    </Context2.Provider>
  );
}
