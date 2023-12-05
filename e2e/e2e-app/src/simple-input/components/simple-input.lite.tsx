import { useMetadata } from '@builder.io/mitosis';

type Props = {
  testId: string;
  disabled?: boolean;
};

useMetadata({
  angular: { nativeAttributes: ['disabled'] },
});

export default function SimpleInput(props: Props) {
  return (
    <div>
      <input data-testid={props.testId} disabled={props.disabled} />
      Hello! If someone passes `[disabled]="false"` to me, disabled shouldn't be visible in the DOM.
    </div>
  );
}
