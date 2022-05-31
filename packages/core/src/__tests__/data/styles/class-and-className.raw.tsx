export default function MyBasicComponent() {
  return (
    <div
      // @ts-ignore
      className="test"
      class="test2"
      css={{
        padding: '10px',
      }}
    >
      Hello! I can run in React, Vue, Solid, or Liquid!
    </div>
  );
}
