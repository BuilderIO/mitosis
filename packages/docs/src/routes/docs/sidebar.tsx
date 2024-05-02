import { Slot, component$, type ClassList } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';

const SidebarLink = component$((props: { href: string }) => {
  const location = useLocation();
  const activeClasses = 'font-bold';
  return (
    <Link
      href={props.href}
      class={[
        'hover:underline',
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
    <div class={[props.class, 'flex flex-col gap-4 p-4 sticky top-0 mt-4 min-w-[200px]']}>
      <SidebarLink href="/docs/overview">Overview</SidebarLink>
      <SidebarLink href="/docs/quickstart">Quickstart</SidebarLink>
      <SidebarLink href="/docs/components">Components</SidebarLink>
      <SidebarLink href="/docs/hooks">Hooks</SidebarLink>
      <SidebarLink href="/docs/context">Context</SidebarLink>
      <SidebarLink href="/docs/customizability">Customization</SidebarLink>
      <SidebarLink href="/docs/configuration">Configuration</SidebarLink>
      <SidebarLink href="/docs/project-structure">Project Structure</SidebarLink>
      <SidebarLink href="/docs/gotchas">Gotchas</SidebarLink>
      <SidebarLink href="/docs/cli">CLI</SidebarLink>
    </div>
  );
});
