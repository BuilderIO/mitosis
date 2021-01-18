import { Show, onMount, useState } from '@jsx-lite/core';
import { BuilderContent, GetContentOptions } from '@builder.io/sdk';
import { useBuilderData } from '@builder.io/jsx-lite';
import { RenderBlock } from './builder-render-block.raw';
import { For } from 'src/flow';

type RenderContentProps = {
  model: string;
  options?: GetContentOptions;
  content?: BuilderContent;
  children: any;
};

export function RenderContent(props: RenderContentProps) {
  const content: BuilderContent | undefined =
    props.content || useBuilderData(props.model, props.options);
  const state = useState({
    get css() {
      return '';
    },
  });

  return (
    <>
      <Show when={!content}>{props.children}</Show>
      <Show when={content}>
        <div
          data-builder-component={content!.name}
          data-builder-content-id={content!.id}
          data-builder-variation-id={content!.testVariationId || content!.id}
        >
          <Show when={state.css}>
            <style innerHTML={state.css} />¸
          </Show>
          <Show when={content!.data!.blocks}>
            <For each={content!.data!.blocks}>
              {(block) => <RenderBlock block={block} />}
            </For>
          </Show>
        </div>
      </Show>
    </>
  );
}
