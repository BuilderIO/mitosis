import { component$ } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';

export default component$(() => {
  const location = useLocation();

  return (
    <header class="bg-neutral-800 p-4 text-white sticky top-0 z-10">
      <div class="flex justify-between items-center">
        <a href="/" title="qwik" class="flex items-center">
          <img
            class="object-contain -my-1"
            width={140}
            height={50}
            src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fbec547b650d74b949faccad67013147f"
          />
        </a>
        <ul class="flex space-x-4">
          <li>
            <Link href="/docs" class="hover:underline">
              Docs
            </Link>
          </li>
          <li>
            <Link href="/playground" class="hover:underline">
              Playground
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
});
