import { docsearch } from 'meilisearch-docsearch';
import 'meilisearch-docsearch/css';

import { ClassList, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';

export const Search = component$((props: { class?: ClassList }) => {
  const divRef = useSignal<HTMLDivElement>();
  const nav = useNavigate();

  useVisibleTask$(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    divRef.value!.innerHTML = '';
    docsearch({
      container: divRef.value!,
      host: 'https://ms-0040a28198ad-9480.lon.meilisearch.io',
      apiKey: '86cf79d6194eff5fe82ed4e5afc7d8135a29697572b9979c8dc8fc506fc58d1a',
      indexUid: 'docs-site-crawl',
      hotKeys: ['/'],
    });

    // Don't allow server side routing, catch it here and navigate client side.
    (window as any).navigation?.addEventListener('navigate', (event: any) => {
      if (event.canIntercept) {
        const url = new URL(event.destination.url);
        event.intercept({
          async handler() {
            await nav(url.pathname + url.search + url.hash);
          },
        });
      }
    });
  });

  return (
    <div class={props.class} id="searchbar" ref={divRef}>
      <button type="button" class="docsearch-btn" aria-label="Search">
        <span class="docsearch-btn-icon-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            class="docsearch-modal-btn-icon"
          >
            <path
              fill="currentColor"
              d="M21.71 20.29L18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.39ZM11 18a7 7 0 1 1 7-7a7 7 0 0 1-7 7Z"
            ></path>
          </svg>
        </span>
        <span class="docsearch-btn-placeholder"> Search</span>
        <span class="docsearch-btn-keys">
          <kbd class="docsearch-btn-key">⌘</kbd>
          <kbd class="docsearch-btn-key">K</kbd>
        </span>
      </button>
    </div>
  );
});
