import { component$, Slot } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import { RightSidebar } from './right-sidebar';
import Sidebar from './sidebar';

export default component$(() => {
  const nav = useNavigate();
  const location = useLocation();

  return (
    <div class="flex items-start max-md:flex-col gap-8 max-md:mt-4">
      <div class="border-primary border-r min-h-screen max-md:min-h-0 border-opacity-50 max-md:border-r-0 sticky top-20 max-md:top-[calc(4rem-2px)] max-md:self-stretch max-md:-m-4 max-md:px-4 max-md:bg-purple-990 max-md:bg-opacity-80 max-md:backdrop-blur max-md:!z-50">
        <Sidebar class="mt-24 max-md:mt-0" />
      </div>
      <div
        onClick$={(e, el) => {
          const closestHeading = (e.target as HTMLElement)?.closest('h1, h2, h3, h4, h5, h6');
          if (closestHeading?.id) {
            const url = new URL(window.location.href);
            url.hash = closestHeading.id;
            nav(url.href);
          }
        }}
        class="grow flex flex-col xl:flex-row p-8 max-md:px-4 max-md:max-w-full mt-8 max-md:mt-0 mb-12 max-md:mb-0 max-md:overflow-x-hidden min-w-0"
      >
        <div class="prose prose-invert lg:prose-xl max-lg:max-w-full max-w-none min-w-0">
          <Slot />
        </div>
        <div class="w-[240px] shrink-0 ml-8 max-xl:ml-0 max-xl:mt-8 max-xl:static max-xl:top-none max-xl:w-full max-xl:border-t border-primary border-opacity-50">
          <RightSidebar key={location.url.pathname} class="mt-4 max-md:mt-4 sticky top-36" />
        </div>
      </div>
    </div>
  );
});
