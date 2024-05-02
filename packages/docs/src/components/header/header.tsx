import { component$ } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';

export default component$(() => {
  const location = useLocation();

  return (
    <header class="bg-neutral-800 text-white sticky top-0 z-10">
      <div class="container mx-auto p-4 flex justify-between items-center">
        <a href="/" title="qwik" class="flex items-center">
          <img
            class="object-contain -my-1"
            width={140}
            height={50}
            src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F0fdb9aabd10f4205b3b3b56d7b950239"
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
