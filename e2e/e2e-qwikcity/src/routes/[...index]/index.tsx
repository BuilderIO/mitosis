import { E2eApp } from '@builder.io/e2e-app-qwik';
import { component$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';

export interface MainProps {
  url: string;
}
export default component$(() => {
  const { url } = useLocation();

  return <E2eApp pathname={url.pathname} />;
});
