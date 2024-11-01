import { Show, useDefaultProps } from '@builder.io/mitosis';

export interface ButtonProps {
  attributes?: any;
  text?: string;
  buttonText?: string; // no default value
  link?: string;
  openLinkInNewTab?: boolean;
  onClick?: () => void;
}

export default function Button(props: ButtonProps) {
  useDefaultProps<ButtonProps>({
    text: 'default text',
    link: 'https://builder.io/',
    openLinkInNewTab: false,
    onClick: () => {
      console.log('hi');
    },
  });

  return (
    <div>
      <Show when={props.link}>
        <a
          {...props.attributes}
          href={props.link}
          target={props.openLinkInNewTab ? '_blank' : undefined}
        >
          {props.text}
        </a>
      </Show>
      <Show when={!props.link}>
        <button {...props.attributes} onClick={() => props.onClick()} type="button">
          {props.buttonText}
        </button>
      </Show>
    </div>
  );
}
