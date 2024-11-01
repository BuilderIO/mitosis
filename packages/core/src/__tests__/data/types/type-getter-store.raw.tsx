import { useStore } from '@builder.io/mitosis';

type GetterStore = {
  getName: () => string;
  name: string;
  get test(): string;
};

export default function TypeGetterStore() {
  const state = useStore<GetterStore>({
    name: 'test',
    getName: () => {
      if (state.name === 'a') {
        return 'b';
      }

      return state.name;
    },
    get test() {
      return 'test';
    },
  });

  return <div>Hello {state.name}! </div>;
}
