import '@builder.io/mitosis/dist/src/jsx-types';
import { Show, useState } from '@builder.io/mitosis';

export type HeaderProps = {};

export default function Header() {
  const state = useState({
    hamburgerMenuOpen: false,
  });

  return (
    <div>
      {/* Header links */}
      <button
        css={{
          color: 'steelblue',
        }}
        onClick={() => {
          state.hamburgerMenuOpen = !state.hamburgerMenuOpen;
        }}
      >
        Toggle hamburger
      </button>
      <Show when={state.hamburgerMenuOpen}>
        <div>I am hamburger menu</div>
      </Show>
    </div>
  );
}
