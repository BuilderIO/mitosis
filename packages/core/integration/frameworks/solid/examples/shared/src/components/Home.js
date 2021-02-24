import { createMutable, Show, For } from "solid-js";
import { css } from "solid-styled-components";

export default function Home() {
  const state = createMutable({ name: "Steve" });

  return (
    <div
      class={css({
        textAlign: "center",
      })}
    >
      <h2>
        Hello,
        {state.name}!
      </h2>

      <input
        value={state.name}
        onInput={(event) => (state.name = event.target.value)}
      />
    </div>
  );
}
