import { useMetadata } from '@builder.io/mitosis';
import { outline } from './data';

useMetadata({
  figma: outline,
});

export default function FigmaButton(props: any) {
  return (
    <button
      data-icon={props.icon}
      data-disabled={props.interactiveState}
      data-width={props.width}
      data-size={props.size}
    >
      {props.label}
    </button>
  );
}
