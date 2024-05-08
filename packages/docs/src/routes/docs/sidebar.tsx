import { Slot, component$, useSignal, type ClassList } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';
import { TbChevronRight } from '@qwikest/icons/tablericons';

const SidebarLink = component$((props: { href: string }) => {
  const location = useLocation();
  const activeClasses = '!text-primary-light font-bold';
  return (
    <Link
      href={props.href}
      class={[
        'p-1.5 hover:text-primary-light transition-colors duration-200 ease-in-out',
        {
          [activeClasses]: location.url.pathname === props.href,
        },
      ]}
    >
      <Slot />
    </Link>
  );
});

export default component$((props: { class?: ClassList }) => {
  const expanded = useSignal(false);

  const backdropStyles =
    'max-md:bg-purple-990 max-md:bg-opacity-95 max-md:backdrop-blur max-md:transform-gpu max-md:!z-50';

  return (
    <div class={[props.class, 'mt-4 min-w-[200px] md:overflow-y-auto max-h-full']}>
      <div
        class={[
          'hidden max-md:flex border-b border-primary border-opacity-50 items-center p-3 -mx-4',
        ]}
      >
        <button
          class="flex gap-2 items-center rounded w-full"
          onClick$={() => {
            expanded.value = !expanded.value;
          }}
        >
          <TbChevronRight
            class={['transform transition-transform', expanded.value && 'rotate-90']}
          />{' '}
          Menu
        </button>
      </div>
      <div
        class={[
          'md:sticky md:top-24 max-md:overflow-auto transition-all max-md:-mx-4 max-md:absolute max-md:top-15 max-md:w-full',
          backdropStyles,
          {
            'max-md:max-h-0': !expanded.value,
            'max-md:max-h-[80vh]': expanded.value,
          },
        ]}
      >
        <div
          onmouseUp$={() => {
            expanded.value = false;
          }}
          class="flex flex-col gap-2 p-4 max-md:border-b border-primary border-opacity-50"
        >
          <SidebarLink href="/docs/overview/">Overview</SidebarLink>
          <SidebarLink href="/docs/quickstart/">Quickstart</SidebarLink>
          <SidebarLink href="/docs/components/">Components</SidebarLink>
          <SidebarLink href="/docs/hooks/">Hooks</SidebarLink>
          <SidebarLink href="/docs/context/">Context</SidebarLink>
          <SidebarLink href="/docs/figma/">Figma</SidebarLink>
          <SidebarLink href="/docs/using-libraries/">Using Libraries</SidebarLink>
          <SidebarLink href="/docs/customizability/">Customization</SidebarLink>
          <SidebarLink href="/docs/configuration/">Configuration</SidebarLink>
          <SidebarLink href="/docs/project-structure/">Project Structure</SidebarLink>
          <SidebarLink href="/docs/cli/">CLI</SidebarLink>
          <SidebarLink href="/docs/gotchas/">Gotchas</SidebarLink>
        </div>
      </div>
    </div>
  );
});
