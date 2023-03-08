import { For, Show, useStore } from '@builder.io/mitosis';
import { COMPONENT_MAP } from './component-map';

export default function Homepage(props: { pathname: string; compProps?: any }) {
  const state = useStore({
    Component: COMPONENT_MAP[props.pathname as keyof typeof COMPONENT_MAP],
  });
  return (
    <div>
      <div>All tests:</div>
      <ul>
        <For each={Object.keys(COMPONENT_MAP)}>
          {(x) => (
            <li>
              <a href={x}>{x}</a>
            </li>
          )}
        </For>
      </ul>

      <Show when={state.Component} else={<div>Could not find component for {props.pathname}</div>}>
        <div>Current Test Component: {props.pathname}</div>
        <state.Component {...props.compProps} />
      </Show>
    </div>
  );
}
