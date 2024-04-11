import { useMetadata } from '@builder.io/mitosis';
import { DisabledProps } from './types';

useMetadata({
  angular: { nativeAttributes: ['disabled'] },
});

export default function NativeInput(props: DisabledProps) {
  return (
    <div>
      <input data-testid={props.testId} disabled={props.disabled} />
      User passed `[disabled]="{props.disabled}"` input should be
      {props.disabled ? ' disabled' : ' enabled'}
    </div>
  );
}
