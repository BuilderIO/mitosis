import { useStore } from '@builder.io/mitosis';

export default function StringLiteralStore() {
  const state = useStore({
    arrowFunction: async () => {
      return Promise.resolve();
    },
    namedFunction: async function namedFunction() {
      return Promise.resolve();
    },
  });

  return <div></div>;
}
