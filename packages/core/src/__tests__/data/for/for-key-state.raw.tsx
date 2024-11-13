import { For, Fragment, useStore } from '@builder.io/mitosis';

export default function ForKeyState() {
  const state = useStore({
    id: 'xyz',
  });

  return (
    <div>
      <For each={['a', 'b', 'c']}>
        {(option) => (
          <Fragment key={`${state.id}-${option}`}>
            <div>{option}</div>
          </Fragment>
        )}
      </For>
      <select>
        <For each={['d', 'e', 'f']}>
          {(option) => (
            <option key={`${state.id}-${option}`} value={option}>
              {option}
            </option>
          )}
        </For>
      </select>
    </div>
  );
}
