import { Show } from '@jsx-lite/core';

export interface ButtonProps {
  attributes?: any;
  text?: string;
  link?: string;
  openLinkInNewTab?: boolean;
}

export default function Button(props: ButtonProps) {
  return (
    <>
      <Show when={props.link}>
        <a
          href={props.link}
          target={props.openLinkInNewTab ? '_blank' : undefined}
          {...props.attributes}
        >
          {props.text}
        </a>
      </Show>
      <Show when={!props.link}>
        <span {...props.attributes}>{props.text}</span>
      </Show>
    </>
  );
}
