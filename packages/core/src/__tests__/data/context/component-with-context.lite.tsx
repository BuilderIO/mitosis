import Context1 from '@dummy/1';
import Context2 from '@dummy/2';
import { useContext, setContext } from '@jsx-lite/core';

export default function ComponentWithContext() {
  const foo = useContext(Context1);

  setContext(Context1, { foo: 'bar' });

  return (
    <Context2.Provider value={{ bar: 'baz' }}>
      <>{foo.value}</>
    </Context2.Provider>
  );
}
