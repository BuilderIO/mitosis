export default function StylePropClassAndCss(props) {
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
