import SimpleInput from './simple-input.lite';

export default function SimpleInputWrapper(props: any) {
  return (
    <div>
      <SimpleInput testId="simple-input-disabled" disabled={true} />
      <SimpleInput testId="simple-input-enabled" disabled={false} />
    </div>
  );
}
