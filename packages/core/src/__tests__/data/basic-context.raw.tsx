import { useState, useContext, onInit } from '@builder.io/mitosis';
import { Injector } from '@dummy/injection-js';

export default function MyBasicComponent() {
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
