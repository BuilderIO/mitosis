import { useStore } from "@builder.io/mitosis";

export default function MyComponent(props) {
  const state = useStore({
    name: "Steve",
    // can't be compiled
    handleFn() {}
  });

    function doSomething() {
    console.log("This is a aa");
  }

  
  return (
    <div>
      <input
        css={{
          color: "red",
        }}
        value={state.name}
        onChange={(event) => { state.name = event.target.value }}
        onClick={() => doSomething()}
      />
      Hello
      {state.name}! I can run in React, Vue, Solid, or Liquid!
    </div>
  );
}
