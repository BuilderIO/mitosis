import { component$, Slot } from '@builder.io/qwik';
import Sidebar from './sidebar';

export default component$(() => {
  return (
    <div class="flex container mx-auto px-4">
      <Sidebar class="sticky top-0" />
      <div class="prose p-8 lg:prose-xl">
        <Slot />
      </div>
    </div>
  );
});
