import { component$, type ClassList } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';

export default component$((props: { class: ClassList }) => {
  const location = useLocation();

  const activeClasses = 'font-bold';

  return (
    <div class={[props.class, 'flex flex-col gap-4 p-4 bg-neutral-100 min-w-[200px]']}>
      <Link
        href="/docs/intro"
        class={[
          'hover:underline',
          {
            [activeClasses]: location.url.pathname === '/docs/intro/',
          },
        ]}
      >
        Intro
      </Link>

      <Link
        href="/docs/cli"
        class={[
          'hover:underline',
          {
            [activeClasses]: location.url.pathname === '/docs/cli/',
          },
        ]}
      >
        CLI
      </Link>
    </div>
  );
});
