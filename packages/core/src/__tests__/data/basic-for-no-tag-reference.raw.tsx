import { For, useStore } from '@builder.io/mitosis';

export default function MyBasicForNoTagRefComponent() {
  const state = useStore({
    name: 'VincentW',
    TagName: 'div',
    tag: 'span',
    get TagNameGetter() {
      return 'span';
    },
  });

  return (
    <state.TagNameGetter>
      Hello <state.tag>{state.name}</state.tag>
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
