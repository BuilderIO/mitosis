import { Hero } from '@components';

export default function MyComponent(props) {
  return (
    <Hero
      title="Your Title Here"
      image="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F52dcecf48f9c48cc8ddd8f81fec63236"
      buttonLink="https://example.com"
      buttonText="Click"
      height={400}
      css={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        position: 'relative',
        flexShrink: '0',
        boxSizing: 'border-box',
        marginTop: '200px',
      }}
    />
  );
}
