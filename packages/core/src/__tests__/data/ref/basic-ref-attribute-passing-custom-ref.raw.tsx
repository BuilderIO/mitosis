import { useMetadata, useRef } from '@builder.io/mitosis';

useMetadata({
  attributePassing: {
    enabled: true,
    customRef: 'buttonRef',
  },
});

export default function BasicRefAttributePassingCustomRefComponent() {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div>
      <button ref={buttonRef}>Attribute Passing</button>
    </div>
  );
}
