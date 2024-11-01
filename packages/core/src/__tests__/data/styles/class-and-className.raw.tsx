import MyComp from './my-component.lite';

export default function MyBasicComponent() {
  return (
    <div>
      <MyComp class="test" className="test2">
        Hello! I can run in React, Vue, Solid, or Liquid!
      </MyComp>
      <div
        className="test"
        class="test2"
        css={{
          padding: '10px',
        }}
      >
        Hello! I can run in React, Vue, Solid, or Liquid!
      </div>
    </div>
  );
}
