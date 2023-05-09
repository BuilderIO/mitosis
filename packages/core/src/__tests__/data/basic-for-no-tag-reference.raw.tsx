import { useStore, For } from '@builder.io/mitosis';

export default function MyBasicForNoTagRefComponent() {
  const state = useStore({
    name: 'VincentW',
  });

  return (
    <div>
      Hello {state.name}
      <For each={props.actions}>
        {(action) => (
          <div>
            <action.icon />
            <span>{action.text}</span>
          </div>
        )}
      </For>
    </div>
  );
}
