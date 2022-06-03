import { useState, onUpdate } from '@builder.io/mitosis';

export default function MyBasicOnUpdateReturnComponent() {
  const state = useState({
    name: 'PatrickJS',
  });

  onUpdate(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    fetch('https://patrickjs.com/api/resource.json', { signal })
      .then((response) => response.json())
      .then((data) => {
        state.name = data.name;
      });
    return () => {
      if (!signal.aborted) {
        controller.abort();
      }
    };
  }, [state.name]);

  return <div>Hello! {state.name}</div>;
}
