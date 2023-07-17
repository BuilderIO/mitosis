export default function MyComponent(props) {
  return (
    <div
      style={props.attributes.style}
      class="builder-column"
      css={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}
    />
  );
}
