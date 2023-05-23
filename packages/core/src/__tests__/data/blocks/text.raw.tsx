import { useStore } from '@builder.io/mitosis';
import { Builder } from '@builder.io/sdk';

export interface TextProps {
  attributes?: any;
  rtlMode: boolean;
  text?: string;
  content?: string;
  builderBlock?: any;
}

export default function Text(props: TextProps) {
  const allowEditingText: boolean =
    Builder.isBrowser &&
    Builder.isEditing &&
    location.search.includes('builder.allowTextEdit=true') &&
    !(
      props.builderBlock?.bindings?.['component.options.text'] ||
      props.builderBlock?.bindings?.['options.text'] ||
      props.builderBlock?.bindings?.['text']
    );
  const state = useStore({ name: 'Decadef20' });

  // TODO: Add back dynamic `direction` CSS prop when we add support for some
  //       sort of dynamic CSS
  // css={{ direction: props.rtlMode ? 'rtl' : 'ltr' }}
  return (
    <div
      contentEditable={allowEditingText || undefined}
      data-name={{ test: state.name || 'any name' }}
      innerHTML={props.text || props.content || state.name || '<p class="text-lg">my name</p>'}
    />
  );
}
