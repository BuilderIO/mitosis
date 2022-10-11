export default function MyBasicComponent() {
  const props = { nested: { hello: 'world' } };
  return <input {...props.nested}></input>;
}
