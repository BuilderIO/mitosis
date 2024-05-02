import { component$ } from '@builder.io/qwik';

export default component$(() => {
  return (
    <footer>
      <div class="container p-8 mt-8 text-center mx-auto">
        <a href="https://www.builder.io/" target="_blank">
          <span>Made with ♡ by Builder.io</span>
        </a>
      </div>
    </footer>
  );
});
