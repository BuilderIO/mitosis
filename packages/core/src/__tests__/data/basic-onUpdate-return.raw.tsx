import { onUpdate, useStore } from '@builder.io/mitosis';

export default function MyBasicOnUpdateReturnComponent() {
  const state = useStore({
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
