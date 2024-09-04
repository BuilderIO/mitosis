import { useMetadata } from '@builder.io/mitosis';

useMetadata({
  angular: { selector: 'not-my-component' },
});

export default function MyComponent() {
  return <span>My selector shouldn't be my-component!</span>;
}
