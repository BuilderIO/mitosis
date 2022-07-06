export interface RawTextProps {
  attributes?: any;
  text?: string;
  // builderBlock?: any;
}

export default function RawText(props: RawTextProps) {
  return (
    <span
      class={props.attributes?.class || props.attributes?.className}
      innerHTML={props.text || ''}
    />
  );
}
