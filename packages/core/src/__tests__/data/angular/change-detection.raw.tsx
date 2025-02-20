import { useMetadata } from '@builder.io/mitosis';

useMetadata({
  angular: {
    changeDetection: 'OnPush',
  },
});

export default function MyComponent(props) {
  return <div>{props.count}</div>;
}
