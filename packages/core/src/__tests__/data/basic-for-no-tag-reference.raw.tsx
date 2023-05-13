import { useStore, For } from '@builder.io/mitosis';

export default function MyBasicForNoTagRefComponent() {
  const state = useStore({
    name: 'VincentW',
    TagName: 'div',
    get TagNameGetter() {
      return 'span';
    },
  });

  return (
    <state.TagNameGetter>
      Hello {state.name}
      <For each={props.actions}>
        {(action) => (
          <state.TagName>
            <action.icon />
            <span>{action.text}</span>
          </state.TagName>
        )}
      </For>
    </state.TagNameGetter>
  );
}
