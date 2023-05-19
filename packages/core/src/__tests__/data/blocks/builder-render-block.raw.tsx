import { For, Show, useContext, useStore } from '@builder.io/mitosis';
import BuilderContext from '../context/builder.context.lite';
import { getBlockActions } from '../functions/get-block-actions';
import { getBlockComponentOptions } from '../functions/get-block-component-options';
import { getBlockProperties } from '../functions/get-block-properties';
import { getBlockStyles } from '../functions/get-block-styles';
import { getBlockTag } from '../functions/get-block-tag';
import { getProcessedBlock } from '../functions/get-processed-block';
import { components } from '../functions/register-component';
import { BuilderBlock } from '../types/builder-block';
import BlockStyles from './block-styles.lite';

export type RenderBlockProps = {
  block: BuilderBlock;
  index: number;
};

export default function RenderBlock(props: RenderBlockProps) {
  const builderContext = useContext(BuilderContext);

  const state = useStore({
    get component() {
      const componentName = state.useBlock.component?.name;
      if (!componentName) {
        return null;
      }
      const ref = components[state.useBlock.component?.name!];
      if (componentName && !ref) {
        // TODO: Public doc page with more info about this message
        console.warn(`
          Could not find a registered component named "${componentName}".
          If you registered it, is the file that registered it imported by the file that needs to render it?`);
      }
      return ref;
    },
    get componentInfo() {
      return state.component?.info;
    },
    get componentRef() {
      return state.component?.component;
    },
    get tagName() {
      return getBlockTag(state.useBlock) as any;
    },
    get properties() {
      return getBlockProperties(state.useBlock);
    },
    get useBlock() {
      return getProcessedBlock({
        block: props.block,
        state: builderContext.state,
        context: builderContext.context,
      });
    },
    get actions() {
      return getBlockActions({
        block: state.useBlock,
        state: builderContext.state,
        context: builderContext.context,
      });
    },
    get css() {
      return getBlockStyles(state.useBlock);
    },
    get componentOptions() {
      return getBlockComponentOptions(state.useBlock);
    },
  });

  return (
    <>
      {/* TODO: add the below back when support `else` */}
      {/* <Show when={state.componentInfo?.noWrap}>
        <state.componentRef
          attributes={state.properties}
          {...state.componentInfo?.options}
          style={state.css}
          children={state.useBlock.children}
        />
      </Show>
      <Show when={!state.componentInfo?.noWrap}> */}
      <state.tagName {...state.properties} style={state.css}>
        <BlockStyles block={state.useBlock} />
        {state.componentRef && (
          <state.componentRef {...state.componentOptions} children={state.useBlock.children} />
        )}
        <Show
          when={!state.componentRef && state.useBlock.children && state.useBlock.children.length}
        >
          <For each={state.useBlock.children}>
            {(child: any, index: number) => <RenderBlock index={index} block={child} />}
          </For>
        </Show>
      </state.tagName>
      {/* </Show> */}
    </>
  );
}
