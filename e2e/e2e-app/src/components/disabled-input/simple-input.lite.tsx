import { useMetadata } from '@builder.io/mitosis';
import { DisabledProps } from './types';

useMetadata({});

export default function SimpleInput(props: DisabledProps) {
  return (
    <div>
      <input data-testid={props.testId} disabled={props.disabled} />
      User passed `[disabled]="{props.disabled}"` input should be
      {props.disabled ? ' disabled' : ' enabled'}
    </div>
  );
}
