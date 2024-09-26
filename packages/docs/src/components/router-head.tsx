import { useDocumentHead, useLocation } from '@builder.io/qwik-city';

import { component$ } from '@builder.io/qwik';

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();

  const canonicalURL = new URL(
    loc.url.pathname + loc.url.search + loc.url.hash,
    'https://mitosis.builder.io',
  );

  return (
    <>
      <title>{head.title}</title>

      <link rel="canonical" href={canonicalURL.toString()} />
      {/* favicon */}
      <link href="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F199eed663ae845baa8a6ea4136a40871" />
      <meta
        property="og:image"
        content="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F55995a55a8e9464b9f26cb206e8eff8f"
      />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Mitosis - write components once, run everywhere" />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_US" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@builderio" />
      <meta name="twitter:creator" content="@builderio" />

      {loc.url.pathname.startsWith('/docs') && (
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.27.0/themes/prism-dark.min.css"
        />
      )}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link
        rel="icon"
        type="image/svg+xml"
        href="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F5a86bcaa3a784a6b9f64f13d4a3016f5"
      />

      {head.meta.map((m) => (
        <meta key={m.key} {...m} />
      ))}

      {head.links.map((l) => (
        <link key={l.key} {...l} />
      ))}

      {head.styles.map((s) => (
        <style key={s.key} {...s.props} dangerouslySetInnerHTML={s.style} />
      ))}

      {head.scripts.map((s) => (
        <script key={s.key} {...s.props} dangerouslySetInnerHTML={s.script} />
      ))}

      <script
        type="text/partytown"
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-P6ZRY0ZT14"
      ></script>
      <script
        type="text/partytown"
        dangerouslySetInnerHTML={`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-P6ZRY0ZT14');
        `}
      />
    </>
  );
});
