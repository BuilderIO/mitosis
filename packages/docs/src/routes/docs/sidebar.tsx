import { Slot, component$, type ClassList } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';

const SidebarLink = component$((props: { href: string }) => {
  const location = useLocation();
  const activeClasses = '!text-primary-light font-bold';
  return (
    <Link
      href={props.href}
      class={[
        'p-2 rounded hover:text-primary-light transition-colors duration-200 ease-in-out',
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
  return (
    <div
      class={[
        props.class,
        'flex flex-col gap-2 p-4 sticky max-md:static top-0 mt-4 min-w-[200px] max-md:w-full',
      ]}
    >
      <SidebarLink href="/docs/overview/">Overview</SidebarLink>
      <SidebarLink href="/docs/quickstart/">Quickstart</SidebarLink>
      <SidebarLink href="/docs/components/">Components</SidebarLink>
      <SidebarLink href="/docs/hooks/">Hooks</SidebarLink>
      <SidebarLink href="/docs/context/">Context</SidebarLink>
      <SidebarLink href="/docs/customizability/">Customization</SidebarLink>
      <SidebarLink href="/docs/configuration/">Configuration</SidebarLink>
      <SidebarLink href="/docs/project-structure/">Project Structure</SidebarLink>
      <SidebarLink href="/docs/gotchas/">Gotchas</SidebarLink>
      <SidebarLink href="/docs/cli/">CLI</SidebarLink>
    </div>
  );
});
