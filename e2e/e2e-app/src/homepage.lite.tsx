import { For, onMount, Show, useStore } from '@builder.io/mitosis';
import { COMPONENT_PATHS } from './component-paths';
import ComponentOnUpdate from './components/component-on-update.lite';
import DefaultProps from './components/default-props/use-default-props.lite';
import DisabledInput from './components/disabled-input/disabled-input.lite';
import NestedParent from './components/nested/nested-parent.lite';
import OneComponent from './components/one-component.lite';
import ShowForComponent from './components/show-for-component.lite';
import SignalParent from './components/signals/signal-parent.lite';
import SpecialTags from './components/special-tags.lite';
import ComponentWithInsideTypes from './components/types/component-with-inside-types.lite';
import ComponentWithOutsideTypes from './components/types/component-with-outside-types.lite';

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

      <Show when={state.pathToUse.startsWith('/default-props')}>
        <DefaultProps bar="xyz" />
      </Show>

      <Show when={state.pathToUse.startsWith('/types')}>
        <ComponentWithInsideTypes name="Lorem ipsum" />
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

      <Show when={state.pathToUse.startsWith('/disabled-input')}>
        <DisabledInput />
      </Show>

      <Show when={state.pathToUse.startsWith('/component-on-update')}>
        <ComponentOnUpdate />
      </Show>

      <Show when={state.pathToUse.startsWith('/component-with-outside-types')}>
        <ComponentWithOutsideTypes text="Before" />
      </Show>
    </div>
  );
}
