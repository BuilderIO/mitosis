import { component$ } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';
import { TbBrandDiscord, TbBrandFigma, TbBrandGithub } from '@qwikest/icons/tablericons';
import { Search } from './search';

export default component$(() => {
  const location = useLocation();

  const isPlayground = location.url.pathname === '/playground/';
  const isDocs = location.url.pathname.startsWith('/docs/');

  return (
    <>
      <div
        class={[
          'bg-primary-dark text-primary-light text-center font-medium px-3 py-3 max-md:py-2.5 rounded text-sm max-md:text-xs transition-all max-h-[50px]',
          isPlayground && 'max-md:max-h-0 max-md:!p-0',
        ]}
      >
        Welcome to our new site! Please{' '}
        <a
          href={`https://docs.google.com/forms/d/e/1FAIpQLSc6jOAOPMRHviiXv4Pkk28fmdFhcX-IprhHvKCIBhjuZKmgiA/viewform?usp=pp_url&entry.1953883676=${encodeURIComponent(
            location.url.href,
          )}`}
          target="_blank"
          class="underline"
        >
          share feedback
        </a>
      </div>
      <header class="text-white sticky top-0 z-50 border-y border-primary border-opacity-50 bg-purple-990 bg-opacity-80 backdrop-blur backdrop-saturate-150">
        <div
          class={[
            'p-6 max-md:p-4 flex justify-between items-center transition-all mx-auto container',
            isPlayground && 'max-w-[100vw]',
          ]}
        >
          <Link prefetch href="/" title="qwik" class="flex items-center">
            <img
              alt="Mitosis logo"
              class="object-contain max-md:max-w-[110px]"
              width={160}
              height={80}
              src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0fdb9aabd10f4205b3b3b56d7b950239"
            />
          </Link>
          <ul class="flex space-x-8 max-md:space-x-6 max-sm:space-x-4 font-medium items-center">
            <li>
              <Search />
            </li>
            <li class="flex gap-4 items-center">
              <Link
                class="hover:text-primary-light text-xl"
                target="_blank"
                href="https://github.com/BuilderIO/mitosis"
              >
                <TbBrandGithub />
              </Link>
              <Link class="hover:text-primary-light text-xl max-sm:hidden" href="/docs/figma/">
                <TbBrandFigma />
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
