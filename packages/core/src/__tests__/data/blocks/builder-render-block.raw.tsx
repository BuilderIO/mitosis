import { BuilderElement } from '@builder.io/sdk';
import {
  useState,
  useDynamicTag,
  createContext,
  Show,
  onError,
  useContext,
  For,
} from '@jsx-lite/core';
import {
  stringToFunction,
  getBlockOptions, // TODO: migrate logic here
  getEmotionCss, // TODO: migrate logic here
} from '@builder.io/utils';

type RenderBlockProps = {
  block: BuilderElement;
};

export const BuilderContext = createContext();

export function RenderBlock(props: RenderBlockProps) {
  const state = useState({
    error: false,
    get useRepeat() {
      return Boolean(
        props.block.repeat?.collection &&
          Array.isArray(stringToFunction(this.repeatArray)),
      );
    },
    get repeatArray() {
      return stringToFunction(props.block.repeat?.collection);
    },
    get itemName() {
      const collectionPath = props.block.repeat?.collection;
      const split = (collectionPath || '')
        .trim()
        .split('(')[0]
        .trim()
        .split('.');
      const collectionName = split[split.length - 1];
      const itemName =
        props.block.repeat?.itemName ||
        (collectionName ? collectionName + 'Item' : 'item');
      return itemName;
    },
    get blockOptions() {
      return getBlockOptions(props.block, context);
    },
    get emotionCss() {
      return getEmotionCss(props.block, context);
    },
  });

  const context = useContext();

  const DynamicTag = useDynamicTag(() => {
    return props.block.tagName || 'div';
  });

  onError(() => (state.error = true));

  return (
    <>
      <Show when={state.error}>
        Builder block error :( Check console for details
      </Show>
      <Show when={!state.error}>
        <Show when={state.useRepeat}>
          <For each={state.repeatArray}>
            {(item, index) => (
              <BuilderContext.Provider>
                <DynamicTag {...state.blockOptions} />
              </BuilderContext.Provider>
            )}
          </For>
        </Show>
        <Show when={!state.useRepeat}>
          <DynamicTag {...state.blockOptions} />
        </Show>
      </Show>
    </>
  );
}
