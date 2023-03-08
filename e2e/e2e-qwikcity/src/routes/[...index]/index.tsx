import { component$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { Homepage } from '@e2e-app/qwik';

export interface MainProps {
  url: string;
}
export const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore
export default component$(() => {
  const { url } = useLocation();

  return <Homepage pathname={url.pathname} />;
});
