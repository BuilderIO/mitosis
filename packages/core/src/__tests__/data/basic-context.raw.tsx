import { useState, useContext, onInit, setContext } from '@builder.io/mitosis';
import { Injector, createInjector } from '@dummy/injection-js';

export default function MyBasicComponent() {
  setContext(Injector, createInjector());

  const injector = useContext(Injector);
  const state = useState({
    name: 'PatrickJS',
  });

  onInit(() => {
    const hi = injector.get('hi');
    console.log(hi);
  });

  return (
    <div>
      {injector.get('hello') + state.name}
      Hello! I can run in React, Vue, Solid, or Liquid!
    </div>
  );
}
