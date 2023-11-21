import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Todos } from '@template/library-qwik';

export default component$(() => {
  return (
    <>
      {/* <AutoComplete
        renderChild={$((props: { item: string }) => (
          <span>{props.item}</span>
        ))}
        getValues={$(async () => {
          return ['Hello', 'Modern', 'Frontends', 'Live!'];
        })}
        transformData={$((x: any) => x)}
      /> */}
      <Todos />
    </>
  );
});

export const head: DocumentHead = {
  title: 'Welcome to Qwik',
  meta: [
    {
      name: 'description',
      content: 'Qwik site description',
    },
  ],
};
