import { useMetadata } from '@builder.io/mitosis';

useMetadata({
  angular: { nativeAttributes: ['disabled'] },
});

export default function MyComponent(props) {
  return (
    <div>
      <input disabled={props.disabled} />
      Hello! If someone passes `[disabled]="false"` to me, disabled shouldn't be visible in the DOM.
    </div>
  );
}
