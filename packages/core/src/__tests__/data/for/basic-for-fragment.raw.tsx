import { For, Fragment } from '@builder.io/mitosis';

export default function BasicForFragment() {
  return (
    <div>
      <For each={['a', 'b', 'c']}>
        {(option) => (
          <Fragment key={`key-${option}`}>
            <div>{option}</div>
          </Fragment>
        )}
      </For>
    </div>
  );
}
