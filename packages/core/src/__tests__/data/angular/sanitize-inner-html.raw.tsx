import { useMetadata } from '@builder.io/mitosis';

useMetadata({
  angular: {
    sanitizeInnerHTML: true,
  },
});

export default function MyComponent(props) {
  return <div innerHTML={props.html}></div>;
}
