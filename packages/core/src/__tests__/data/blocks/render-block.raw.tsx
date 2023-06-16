import { For, Show, useStore } from '@builder.io/mitosis';
import { TARGET } from '../../constants/target.js';
import type { BuilderContextInterface, RegisteredComponent } from '../../context/types.js';
import { evaluate } from '../../functions/evaluate.js';
import { extractTextStyles } from '../../functions/extract-text-styles.js';
import { getBlockActions } from '../../functions/get-block-actions.js';
import { getBlockComponentOptions } from '../../functions/get-block-component-options.js';
import { getBlockProperties } from '../../functions/get-block-properties.js';
import { getBlockTag } from '../../functions/get-block-tag.js';
import { getProcessedBlock } from '../../functions/get-processed-block.js';
import { getReactNativeBlockStyles } from '../../functions/get-react-native-block-styles.js';
import type { BuilderBlock } from '../../types/builder-block.js';
import type { Nullable } from '../../types/typescript.js';
import BlockStyles from './block-styles.lite';
import { isEmptyHtmlElement } from './render-block.helpers.js';
import RenderComponentWithContext from './render-component-with-context.lite';
import type { RenderComponentProps } from './render-component.lite';
import RenderComponent from './render-component.lite';
import RenderRepeatedBlock from './render-repeated-block.lite';
import type { RepeatData } from './types.js';

export type RenderBlockProps = {
  block: BuilderBlock;
  context: BuilderContextInterface;
};

export default function RenderBlock(props: RenderBlockProps) {
  const state = useStore({
    get component(): Nullable<RegisteredComponent> {
      const componentName = getProcessedBlock({
        block: props.block,
        state: props.context.state,
        context: props.context.context,
        shouldEvaluateBindings: false,
      }).component?.name;

      if (!componentName) {
        return null;
      }

      const ref = props.context.registeredComponents[componentName];

      if (!ref) {
        // TODO: Public doc page with more info about this message
        console.warn(`
          Could not find a registered component named "${componentName}". 
          If you registered it, is the file that registered it imported by the file that needs to render it?`);
        return undefined;
      } else {
        return ref;
      }
    },
    get tag() {
      return getBlockTag(state.useBlock);
    },
    get useBlock(): BuilderBlock {
      return state.repeatItemData
        ? props.block
        : getProcessedBlock({
            block: props.block,
            state: props.context.state,
            context: props.context.context,
            shouldEvaluateBindings: true,
          });
    },
    get actions() {
      return getBlockActions({
        block: state.useBlock,
        state: props.context.state,
        context: props.context.context,
      });
    },
    get attributes() {
      const blockProperties = getBlockProperties(state.useBlock);
      return {
        ...blockProperties,
        ...(TARGET === 'reactNative'
          ? {
              style: getReactNativeBlockStyles({
                block: state.useBlock,
                context: props.context,
                blockStyles: blockProperties.style,
              }),
            }
          : {}),
      };
    },

    get shouldWrap() {
      return !state.component?.noWrap;
    },

    get renderComponentProps(): RenderComponentProps {
      return {
        blockChildren: state.useChildren,
        componentRef: state.component?.component,
        componentOptions: {
          ...getBlockComponentOptions(state.useBlock),
          /**
           * These attributes are passed to the wrapper element when there is one. If `noWrap` is set to true, then
           * they are provided to the component itself directly.
           */
          ...(state.shouldWrap
            ? {}
            : {
                attributes: {
                  ...state.attributes,
                  ...state.actions,
                },
              }),
          customBreakpoints: state.childrenContext?.content?.meta?.breakpoints,
        },
        context: state.childrenContext,
      };
    },
    get useChildren() {
      // TO-DO: When should `canHaveChildren` dictate rendering?
      // This is currently commented out because some Builder components (e.g. Box) do not have `canHaveChildren: true`,
      // but still receive and need to render children.
      // return state.componentInfo?.canHaveChildren ? state.useBlock.children : [];
      return state.useBlock.children ?? [];
    },
    get childrenWithoutParentComponent() {
      /**
       * When there is no `componentRef`, there might still be children that need to be rendered. In this case,
       * we render them outside of `componentRef`.
       * NOTE: We make sure not to render this if `repeatItemData` is non-null, because that means we are rendering an array of
       * blocks, and the children will be repeated within those blocks.
       */
      const shouldRenderChildrenOutsideRef = !state.component?.component && !state.repeatItemData;

      return shouldRenderChildrenOutsideRef ? state.useChildren : [];
    },

    get repeatItemData(): RepeatData[] | undefined {
      /**
       * we don't use `state.useBlock` here because the processing done within its logic includes evaluating the block's bindings,
       * which will not work if there is a repeat.
       */
      const { repeat, ...blockWithoutRepeat } = props.block;

      if (!repeat?.collection) {
        return undefined;
      }

      const itemsArray = evaluate({
        code: repeat.collection,
        state: props.context.state,
        context: props.context.context,
      });

      if (!Array.isArray(itemsArray)) {
        return undefined;
      }

      const collectionName = repeat.collection.split('.').pop();
      const itemNameToUse = repeat.itemName || (collectionName ? collectionName + 'Item' : 'item');

      const repeatArray = itemsArray.map<RepeatData>((item, index) => ({
        context: {
          ...props.context,
          state: {
            ...props.context.state,
            $index: index,
            $item: item,
            [itemNameToUse]: item,
            [`$${itemNameToUse}Index`]: index,
          },
        },
        block: blockWithoutRepeat,
      }));

      return repeatArray;
    },

    get inheritedTextStyles() {
      if (TARGET !== 'reactNative') {
        return {};
      }

      const styles = getReactNativeBlockStyles({
        block: state.useBlock,
        context: props.context,
        blockStyles: state.attributes.style,
      });

      return extractTextStyles(styles);
    },

    get childrenContext(): BuilderContextInterface {
      return {
        apiKey: props.context.apiKey,
        state: props.context.state,
        content: props.context.content,
        context: props.context.context,
        registeredComponents: props.context.registeredComponents,
        inheritedStyles: state.inheritedTextStyles,
      };
    },

    get renderComponentTag(): any {
      if (TARGET === 'reactNative') {
        return RenderComponentWithContext;
      } else if (TARGET === 'vue3') {
        // vue3 expects a string for the component tag
        return 'RenderComponent';
      } else {
        return RenderComponent;
      }
    },
  });

  return (
    <Show
      when={state.shouldWrap}
      else={<state.renderComponentTag {...state.renderComponentProps} />}
    >
      {/*
       * Svelte is super finicky, and does not allow an empty HTML element (e.g. `img`) to have logic inside of it,
       * _even_ if that logic ends up not rendering anything.
       */}
      <Show when={isEmptyHtmlElement(state.tag)}>
        <state.tag {...state.attributes} {...state.actions} />
      </Show>
      <Show when={!isEmptyHtmlElement(state.tag) && state.repeatItemData}>
        <For each={state.repeatItemData}>
          {(data, index) => (
            <RenderRepeatedBlock key={index} repeatContext={data.context} block={data.block} />
          )}
        </For>
      </Show>
      <Show when={!isEmptyHtmlElement(state.tag) && !state.repeatItemData}>
        <state.tag {...state.attributes} {...state.actions}>
          <state.renderComponentTag {...state.renderComponentProps} />
          {/**
           * We need to run two separate loops for content + styles to workaround the fact that Vue 2
           * does not support multiple root elements.
           */}
          <For each={state.childrenWithoutParentComponent}>
            {(child) => (
              <RenderBlock
                key={'render-block-' + child.id}
                block={child}
                context={state.childrenContext}
              />
            )}
          </For>
          <For each={state.childrenWithoutParentComponent}>
            {(child) => (
              <BlockStyles
                key={'block-style-' + child.id}
                block={child}
                context={state.childrenContext}
              />
            )}
          </For>
        </state.tag>
      </Show>
    </Show>
  );
}
