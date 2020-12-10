import { Show, For } from '@jsx-lite/core';
import { BuilderElement } from '@builder.io/sdk';
import { BuilderBlock as BuilderBlockComponent } from '@fake';

export interface SectionProps {
  attributes?: any;
  builderBlock?: BuilderElement;
  maxWidth?: number;
}

export default function SectionComponent({
  maxWidth,
  builderBlock,
  ...props
}: SectionProps) {
  return (
    <section
      {...props.attributes}
      style={
        maxWidth && typeof maxWidth === 'number' ? { maxWidth } : undefined
      }
    >
      <Show when={builderBlock && builderBlock.children}>
        <For each={builderBlock?.children}>
          {(block) => <BuilderBlockComponent key={block.id} block={block} />}
        </For>
      </Show>
    </section>
  );
}
