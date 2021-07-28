import {
  Show,
  onMount,
  useState,
  For,
  afterUnmount,
} from '@builder.io/mitosis';
import { Builder, BuilderContent, GetContentOptions } from '@builder.io/sdk';
import { applyPatchWithMinimalMutationChain } from '@builder.io/utils';
import { useBuilderData } from '@builder.io/mitosis';
import { RenderBlock } from './builder-render-block.raw';

type RenderContentProps = {
  model: string;
  options?: GetContentOptions;
  content?: BuilderContent;
  children: any;
  contentLoaded?: (content: BuilderContent) => void;
};

export function RenderContent(props: RenderContentProps) {
  const content: BuilderContent | undefined =
    props.content || useBuilderData(props.model, props.options);
  const state = useState({
    get css() {
      return '';
    },
    onWindowMessage(event: MessageEvent) {
      const message = event.data;
      if (!message) {
        return;
      }
      switch (message.type) {
        case 'builder.patchUpdates': {
          const { data } = message;
          if (!content) {
            return;
          }
          if (!(data && data.data)) {
            break;
          }
          const patches = data.data[content.data?.id];
          if (!(patches && patches.length)) {
            return;
          }

          for (const patch of patches) {
            applyPatchWithMinimalMutationChain(content.data, patch);
          }

          if (props.contentLoaded) {
            props.contentLoaded(content);
          }

          break;
        }
      }
    },
  });

  onMount(() => {
    if (Builder.isEditing) {
      addEventListener('message', state.onWindowMessage);
    }
  });

  afterUnmount(() => {
    if (Builder.isEditing) {
      removeEventListener('message', state.onWindowMessage);
    }
  });

  return (
    <>
      <Show when={!content}>{props.children}</Show>
      <Show when={content}>
        <div
          data-builder-model-name={props.model}
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
