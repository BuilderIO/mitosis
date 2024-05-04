import { component$, Slot } from '@builder.io/qwik';
import type { RequestHandler } from '@builder.io/qwik-city';
import { useLocation } from '@builder.io/qwik-city';

import Footer from '../components/footer';
import Header from '../components/header';

export const onGet: RequestHandler = async ({ cacheControl, url, redirect }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.dev/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    staleIfError: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });

  if (
    url.pathname === '/' &&
    // Old fiddle params to redirect to the new playground
    (url.searchParams.get('outputTab') ||
      url.searchParams.get('code') ||
      url.searchParams.get('inputTab'))
  ) {
    const newUrl = new URL(url.href);
    newUrl.pathname = '/playground';
    throw redirect(302, newUrl.href);
  }
};

export default component$(() => {
  const location = useLocation();

  const isPlayground = location.url.pathname === '/playground/';
  const isHome = location.url.pathname === '/';

  return (
    <>
      <div class={['flex flex-col', isPlayground ? 'min-h-screen' : 'min-h-[80vh]']}>
        <Header />
        <main class={[isPlayground || isHome ? 'grow flex flex-col' : 'container mx-auto px-4']}>
          <Slot />
        </main>
      </div>
      {!isPlayground && <Footer />}
    </>
  );
});
