import { useStore } from '@builder.io/mitosis';
import { BuilderContent, GetContentOptions } from '@builder.io/sdk';
import RenderBlock, { RenderBlockProps } from './builder-render-block.raw';

type RenderContentProps = {
  options?: GetContentOptions;
  content: BuilderContent;
  renderContentProps: RenderBlockProps;
};

export default function RenderContent(props: RenderContentProps) {
  const state = useStore({
    getRenderContentProps(block, index): RenderBlockProps {
      return {
        block: block,
        index: index,
      };
    },
  });

  return <RenderBlock {...state.getRenderContentProps(props.renderContentProps.block, 0)} />;
}
