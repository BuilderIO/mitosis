import { configure } from 'mobx';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Script from 'next/script';
import { theme } from '../src/constants/theme';

const App = dynamic(() => import('../src/components/App'), {
  ssr: false,
  loading: () => <div>loading fiddle...</div>,
});

configure({
  enforceActions: 'never',
});

export default () => {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href={theme.darkMode ? '/favicon-dark.ico' : '/favicon.ico'} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="Write components once, run everywhere. Compiles to Vue, React, Solid, and Liquid. Import code from Figma and Builder.io"
        />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="Mitosis Fiddle" />
        <meta
          property="og:description"
          content="Write components once, run everywhere. Compiles to Vue, React, Angular, and more. Import code from Figma and Builder.io"
        />
        <meta property="og:image:height" content="640" />
        <meta property="og:image:width" content="1280" />
        <meta property="og:image:type" content="image/png" />
        <meta
          property="og:image"
          content="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fa41b6f2a56154fe5986d7ab2025d3dfe"
        />
        <meta property="og:url" content="https://mitosis.builder.io" />
        <link rel="canonical" href="https://mitosis.builder.io" />
        <title>Mitosis Fiddle - compile to common frameworks, import from popular tools</title>
      </Head>
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <App />

      <Script async src="https://cdn.builder.io/js/editor@1.0.42-0"></Script>

      {/* <!-- Global site tag (gtag.js) - Google Analytics --> */}
      <Script async src="https://www.googletagmanager.com/gtag/js?id=G-LFJQTJMFD3"></Script>
      <Script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag() {
            dataLayer.push(arguments);
          }
          gtag('js', new Date());

          gtag('config', 'G-LFJQTJMFD3');
          `}
      </Script>
    </>
  );
};
