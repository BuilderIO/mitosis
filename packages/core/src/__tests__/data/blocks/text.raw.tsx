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

  return (
    <div
      contentEditable={allowEditingText || undefined}
      innerHTML={props.text || props.content || ''}
    />
  );
}
