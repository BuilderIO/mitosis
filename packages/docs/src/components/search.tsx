import { docsearch } from 'meilisearch-docsearch';
import 'meilisearch-docsearch/css';

import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';

export const Search = component$(() => {
  const divRef = useSignal<HTMLDivElement>();
  const nav = useNavigate();

  useVisibleTask$(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    docsearch({
      container: divRef.value!,
      host: 'https://ms-0040a28198ad-9480.lon.meilisearch.io',
      apiKey: '86cf79d6194eff5fe82ed4e5afc7d8135a29697572b9979c8dc8fc506fc58d1a',
      indexUid: 'docs-site-crawl',
    });

    (window as any).navigation?.addEventListener('navigate', (event: any) => {
      if (event.canIntercept) {
        const url = new URL(event.destination.url);
        event.intercept({
          async handler() {
            await nav(url.pathname);
          },
        });
      }
    });
  });

  return <div class="max-sm:hidden -my-2" id="searchbar" ref={divRef} />;
});
