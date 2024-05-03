import { docsearch } from 'meilisearch-docsearch';
import 'meilisearch-docsearch/css';

import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';

export const Search = component$(() => {
  const divRef = useSignal<HTMLDivElement>();

  useVisibleTask$(() => {
    docsearch({
      container: '#searchbar',
      host: "https://ms-0040a28198ad-9480.lon.meilisearch.io",
      apiKey: "86cf79d6194eff5fe82ed4e5afc7d8135a29697572b9979c8dc8fc506fc58d1a", 
      indexUid: "docs-site-crawl",
    });
  });

  return <div id="searchbar" ref={divRef} />;
});
