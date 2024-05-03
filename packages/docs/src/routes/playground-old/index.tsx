import { component$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';

export default component$(() => {
  const location = useLocation();
  const code = location.url.searchParams.get('code');
  const outputTab = location.url.searchParams.get('outputTab');
  const inputTab = location.url.searchParams.get('inputTab');

  const iframeUrl = new URL('https://mitosis-three.vercel.app');
  if (code) {
    iframeUrl.searchParams.set('code', code);
  }
  if (outputTab) {
    iframeUrl.searchParams.set('outputTab', outputTab);
  }
  if (inputTab) {
    iframeUrl.searchParams.set('inputTab', inputTab);
  }

  return (
    <div class="relative">
      <iframe class="fixed inset-0 top-1.5 w-full h-full" src={iframeUrl.href} />
    </div>
  );
});
