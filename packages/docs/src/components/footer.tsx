import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { TbBrandDiscord, TbBrandGithub } from '@qwikest/icons/tablericons';

export default component$(() => {
  return (
    <footer class="border-t border-primary border-opacity-50 pb-4">
      <div class="container p-8 md:my-8 mx-auto flex">
        <a href="https://www.builder.io/" target="_blank">
          <span>Made with ❤️</span>

          <img
            class="object-contain mx-auto mt-3 max-sm:w-[150px]"
            width={200}
            height={90}
            src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fe2052e9c2ef34dab98709a67fcc4b8c3"
          />
        </a>
        <div class="flex gap-4 ml-auto items-center text-3xl">
          <Link
            class="hover:text-primary-light"
            target="_blank"
            href="https://github.com/BuilderIO/mitosis"
          >
            <TbBrandGithub />
          </Link>
          <Link
            class="hover:text-primary-light"
            target="_blank"
            href="https://discord.com/invite/SNusEyNGsx"
          >
            <TbBrandDiscord />
          </Link>
        </div>
      </div>
    </footer>
  );
});
