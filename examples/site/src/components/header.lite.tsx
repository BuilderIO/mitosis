import '@jsx-lite/core/dist/src/jsx-types';
import { Show, useState } from '@jsx-lite/core';

export type HeaderProps = {};

export default function Header() {
  const state = useState({
    hamburgerMenuOpen: false,
  });

  return (
    <div>
      {/* Header links */}
      <button
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
