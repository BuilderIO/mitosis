import { For, onMount, Show, useStore } from '@builder.io/mitosis';
import { COMPONENT_PATHS } from './component-paths';
import ComponentWithTypes from './components/component-with-types.lite';
import NestedParent from './components/nested/nested-parent.lite';
import OneComponent from './components/one-component.lite';
import ShowForComponent from './components/show-for-component.lite';
import SignalParent from './components/signals/signal-parent.lite';
import SpecialTags from './components/special-tags.lite';

export default function Homepage(props: { pathname?: string }) {
  const state = useStore({
    pathToUse: '',
  });

  onMount(() => {
    state.pathToUse = props.pathname || window.location.pathname;
  });

  return (
    <div>
      <div>All tests:</div>
      <ul>
        <For each={COMPONENT_PATHS}>
          {(x) => (
            <li>
              <a href={x}>{x}</a>
            </li>
          )}
        </For>
      </ul>

      <Show when={state.pathToUse}>
        <div>Current Test Component: {state.pathToUse}</div>
      </Show>

      <Show when={state.pathToUse.startsWith('/one-component')}>
        <OneComponent />
      </Show>

      <Show when={state.pathToUse.startsWith('/two-component')}>
        <NestedParent />
      </Show>

      <Show when={state.pathToUse.startsWith('/types')}>
        <ComponentWithTypes name="Lorem ipsum" />
      </Show>

      <Show when={state.pathToUse.startsWith('/show-for-component')}>
        <ShowForComponent />
      </Show>

      <Show when={state.pathToUse.startsWith('/special-tags')}>
        <SpecialTags />
      </Show>

      <Show when={state.pathToUse.startsWith('/signals')}>
        <SignalParent />
      </Show>
    </div>
  );
}
