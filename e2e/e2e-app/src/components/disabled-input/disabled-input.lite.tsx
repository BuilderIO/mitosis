import NativeInput from './native-input.lite';
import SimpleInput from './simple-input.lite';

export default function DisabledInput() {
  return (
    <div>
      <SimpleInput testId="simple-input-disabled" disabled={true} />
      <SimpleInput testId="simple-input-enabled" disabled={false} />
      <NativeInput testId="native-input-disabled" disabled={true} />
      <NativeInput testId="native-input-enabled" disabled={false} />
    </div>
  );
}
