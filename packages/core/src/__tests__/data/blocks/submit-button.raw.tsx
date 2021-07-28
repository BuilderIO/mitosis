import '@builder.io/mitosis';

export interface ButtonProps {
  attributes?: any;
  text?: string;
}

export default function SubmitButton(props: ButtonProps) {
  return (
    <button {...props.attributes} type="submit">
      {props.text}
    </button>
  );
}
