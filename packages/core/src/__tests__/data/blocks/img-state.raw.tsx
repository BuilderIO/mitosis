import { useStore, For, Show } from '@builder.io/mitosis';
import { Builder } from '@builder.io/sdk';

export default function ImgStateComponent() {
  const state = useStore({
    canShow: true,
    images: ['http://example.com/qwik.png'],
  });
  return (
    <div>
      <For each={state.images}>
        {(item, itemIndex) => (
          <>
            <img class={'custom-class'} src={item} key={itemIndex} />
          </>
        )}
      </For>
    </div>
  );
}
