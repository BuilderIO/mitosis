export default function MyBasicComponent() {
  const props = { hello: 'world' };
  return <input {...props}></input>;
}
