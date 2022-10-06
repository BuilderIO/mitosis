export default function MyBasicComponent() {
  const attrs = { hello: 'world' };
  return <input {...attrs}></input>;
}
