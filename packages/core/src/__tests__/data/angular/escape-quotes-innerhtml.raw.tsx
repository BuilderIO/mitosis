import { useMetadata } from '@builder.io/mitosis';

useMetadata({
  angular: {
    changeDetection: 'OnPush',
  },
});

export default function MyComponent(props: { text?: string }) {
  return (
    <div
      innerHTML={`<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
                <script src="URL_1" defer></script>
                <script src="URL_2"></script>`}
    />
  );
}
