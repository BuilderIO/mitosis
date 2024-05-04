import { component$, useStyles$ } from '@builder.io/qwik';
import { useContent, useLocation } from '@builder.io/qwik-city';
import { TbBrandDiscord, TbEdit, TbMessage } from '@qwikest/icons/tablericons';
import styles from './on-this-page.css?inline';

const QWIK_GROUP = [
  'components',
  'concepts',
  'faq',
  'getting-started',
  'think-qwik',
  'deprecated-features',
];

const QWIK_ADVANCED_GROUP = [
  'containers',
  'custom-build-dir',
  'dollar',
  'eslint',
  'library',
  'optimizer',
  'modules-prefetching',
  'qrl',
  'qwikloader',
  'vite',
];

const QWIKCITY_GROUP = [
  'action',
  'api',
  'caching',
  'endpoints',
  'env-variables',
  'guides',
  'html-attributes',
  'layout',
  'middleware',
  'pages',
  'project-structure',
  'qwikcity',
  'route-loader',
  'routing',
  'server$',
  'troubleshooting',
  'validator',
];
const QWIKCITY_ADVANCED_GROUP = [
  'content-security-policy',
  'menu',
  'request-handling',
  'routing',
  'sitemaps',
  'speculative-module-fetching',
  'static-assets',
];

// Transform:
//   /docs/overview/ to 'overview'
//   /docs/overview/quickstart/ to 'overview/quickstart'
//   etc
const getGithubFilePath = (path: string): string => {
  return path.split('/').slice(2, -1).join('/');
};

export const OnThisPage = component$(() => {
  useStyles$(styles);
  const { headings } = useContent();
  const contentHeadings = headings?.filter((h) => h.level <= 3) || [];

  const { url } = useLocation();

  const githubEditRoute = getGithubFilePath(url.pathname);

  const editUrl = `https://github.com/Builderio/mitosis/edit/main/packages/docs/src/routes/docs/${githubEditRoute}/index.mdx`;

  const OnThisPageMore = [
    {
      href: `https://docs.google.com/forms/d/e/1FAIpQLSc6jOAOPMRHviiXv4Pkk28fmdFhcX-IprhHvKCIBhjuZKmgiA/viewform?usp=pp_url&entry.1953883676=${encodeURIComponent(
        url.href,
      )}`,
      text: 'Share feedback',
      icon: TbMessage,
    },
    {
      href: 'https://qwik.dev/chat',
      text: 'Join our community',
      icon: TbBrandDiscord,
    },
    {
      href: editUrl,
      text: 'Edit this Page',
      icon: TbEdit,
    },
  ];

  return (
    <aside class="on-this-page text-sm overflow-y-auto hidden xl:block">
      {contentHeadings.length > 0 ? (
        <>
          <h6>On This Page</h6>
          <ul class="px-2 font-medium text-[var(--interactive-text-color)]">
            {contentHeadings.map((h) => (
              <li key={h.id}>
                <a href={`#${h.id}`} class={`${h.level > 2 ? 'ml-4' : null} on-this-page-item`}>
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <h6>More</h6>
      <ul class="px-2 font-medium text-[var(--interactive-text-color)]">
        {OnThisPageMore.map((el, index) => {
          return (
            <li class={`rounded-lg`} key={`more-items-on-this-page-${index}`}>
              <a class="more-item" href={el.href} rel="noopener" target="_blank">
                <el.icon width={20} height={20} />
                <span>{el.text}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
});
