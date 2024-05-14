import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { TbBrandDiscord, TbBrandFigma, TbBrandGithub } from '@qwikest/icons/tablericons';

export default component$(() => {
  const year = new Date().getFullYear();

  return (
    <footer class="border-t border-primary border-opacity-50 pb-4">
      <div class="container md:my-8 p-8 mx-auto flex gap-4 max-md:flex-col-reverse">
        <div class="block max-md:mt-8">
          <a class="block text-primary-light" href="https://www.builder.io/" target="_blank">
            Made with ❤️ by
            <img
              alt="Builder.io logo"
              class="object-contain mt-3 max-sm:w-[150px]"
              width={200}
              height={90}
              src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fe2052e9c2ef34dab98709a67fcc4b8c3"
            />
          </a>
          <div class="text-xs mt-4 text-primary-light opacity-90 font-light">
            Copyright © {year} Builder.io, Inc.
          </div>
        </div>
        <div class="flex max-md:flex-col gap-8 md:ml-auto items-center text-3xl max-md:items-start max-md:mt-2">
          <div class="flex gap-4 text-base">
            <Link prefetch href="/docs/" class="hover:text-primary-light">
              Docs
            </Link>

            <Link prefetch href="/playground/" class="hover:text-primary-light">
              Playground
            </Link>
          </div>
          <div class="flex gap-4">
            <Link aria-label="Figma logo" class="hover:text-primary-light" href="/docs/figma/">
              <TbBrandFigma />
            </Link>
            <Link
              aria-label="GitHub logo"
              class="hover:text-primary-light"
              target="_blank"
              href="https://github.com/BuilderIO/mitosis"
            >
              <TbBrandGithub />
            </Link>
            <Link
              aria-label="Discord logo"
              class="hover:text-primary-light"
              target="_blank"
              href="https://discord.com/invite/SNusEyNGsx"
            >
              <TbBrandDiscord />
            </Link>
            {/* <Search class="ml-3 max-md:-ml-3 max-md:mr-1" /> */}
          </div>
        </div>
      </div>
    </footer>
  );
});
