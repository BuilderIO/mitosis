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
      <div
        onClick={() => {
          state.hamburgerMenuOpen = false;
        }}
      >
        {/* Hamburger menu  button */}
      </div>
      <Show when={state.hamburgerMenuOpen}>
        {/* Hamburger menu contents */}
      </Show>
    </div>
  );
}
