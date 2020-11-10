export const submitButtonBlock = `
export interface ButtonProps {
  attributes?: any;
  text?: string;
}

export default function SubmitButton(props: ButtonProps) {
  return (
    <button  {...this.props.attributes} type="submit">
      {props.text}
    </button>
  );
}
`;
