import { useMetadata } from '@builder.io/mitosis';
export type DisabledProps = {
  testId: string;
  disabled?: boolean;
};
useMetadata({
  angular: { nativeAttributes: ['disabled'] },
});

export default function NativeInput(props: DisabledProps) {
  return (
    <div>
      <input data-testid={props.testId} disabled={props.disabled} />
    </div>
  );
}
