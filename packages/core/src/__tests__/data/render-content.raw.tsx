import { setContext, onMount, onUpdate } from '@builder.io/mitosis';
import {
  sendComponentsToVisualEditor,
  dispatchNewContentToVisualEditor,
  trackClick,
} from '@dummy/injection-js';
import BuilderContext from '@dummy/context.lite';
import RenderBlocks from '@dummy/RenderBlocks.lite.tsx';

type Props = {
  customComponents: string[];
  content: { blocks: any[]; id: string };
};

export default function RenderContent(props: Props) {
  onMount(() => {
    sendComponentsToVisualEditor(props.customComponents);
  });

  onUpdate(() => {
    dispatchNewContentToVisualEditor(props.content);
  }, [props.content]);

  setContext(BuilderContext, {
    get content() {
      return 3;
    },
    get registeredComponents() {
      return 4;
    },
  });

  return (
    <div
      css={{ display: 'flex', flexDirection: 'columns' }}
      onClick={() => trackClick(props.content.id)}
    >
      <RenderBlocks blocks={props.content.blocks} />
    </div>
  );
}
