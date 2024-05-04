import { component$ } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';
import { TbBrandDiscord, TbBrandGithub } from '@qwikest/icons/tablericons';
import { Search } from './search';

export default component$(() => {
  const location = useLocation();

  const isPlayground = location.url.pathname === '/playground/';
  const isDocs = location.url.pathname.startsWith('/docs/');

  return (
    <>
      <div class="bg-primary text-center font-medium text-black px-3 py-2 rounded max-md:text-sm">
        Welcome to our new site! It's WIP :)
      </div>
      <header class="text-white sticky top-0 z-10 border-b border-primary border-opacity-50 bg-purple-990">
        <div
          class={[
            'p-6 max-md:p-4 flex justify-between items-center transition-all mx-auto container',
            isPlayground && 'max-w-[100vw]',
          ]}
        >
          <Link prefetch href="/" title="qwik" class="flex items-center">
            <img
              class="object-contain max-md:max-w-[110px]"
              width={160}
              height={80}
              src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0fdb9aabd10f4205b3b3b56d7b950239"
            />
          </Link>
          <ul class="flex space-x-8 max-md:space-x-6 font-medium items-center">
            <Search />
            <li class="flex gap-4 items-center">
              <Link
                class="hover:text-primary-light text-xl"
                target="_blank"
                href="https://github.com/BuilderIO/mitosis"
              >
                <TbBrandGithub />
              </Link>
              <Link
                class="hover:text-primary-light text-xl max-sm:hidden"
                target="_blank"
                href="https://discord.com/invite/SNusEyNGsx"
              >
                <TbBrandDiscord />
              </Link>
            </li>
            <li>
              <Link
                prefetch
                href="/docs/"
                class={['hover:text-primary-light', isDocs && 'text-primary-light']}
              >
                Docs
              </Link>
            </li>
            <li>
              <Link
                prefetch
                href="/playground/"
                class={['hover:text-primary-light', isPlayground && 'text-primary-light']}
              >
                Playground
              </Link>
            </li>
            <li class="max-md:hidden">
              <Link
                prefetch
                href="/docs/quickstart/"
                class="bg-primary rounded hover:bg-primary-light px-4 py-3 text-black"
              >
                Get Started
              </Link>
            </li>
          </ul>
        </div>
      </header>
    </>
  );
});
