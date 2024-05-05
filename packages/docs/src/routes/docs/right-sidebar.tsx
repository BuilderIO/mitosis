import { ClassList, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useContent, useLocation } from '@builder.io/qwik-city';
import { TbBrandDiscord, TbEdit, TbMessage } from '@qwikest/icons/tablericons';
import { throttle } from 'lodash-es';

// Transform:
//   /docs/overview/ to 'overview'
//   /docs/overview/quickstart/ to 'overview/quickstart'
//   etc
const getGithubFilePath = (path: string): string => {
  return path.split('/').slice(2, -1).join('/');
};

export const RightSidebar = component$((props: { class: ClassList }) => {
  const { headings } = useContent();
  const contentHeadings = headings?.filter((h) => h.level <= 3) || [];
  const activeHeadingIndex = useSignal(0);

  const { url } = useLocation();

  const githubEditRoute = getGithubFilePath(url.pathname);

  useVisibleTask$(({ cleanup }) => {
    const fn = throttle(() => {
      const activeIndex = contentHeadings.findIndex((h) => {
        const el = document.getElementById(h.id);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top >= 150;
      });

      activeHeadingIndex.value =
        activeIndex > 0 ? activeIndex - 1 : activeIndex === -1 ? contentHeadings.length - 1 : 0;
    }, 50);

    window.addEventListener('scroll', fn);
    cleanup(() => {
      window.removeEventListener('scroll', fn);
    });
  });

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
      href: 'https://discord.com/invite/SNusEyNGsx',
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
    <aside class={['text-sm overflow-y-auto max-h-full', props.class]}>
      {contentHeadings.length > 0 ? (
        <>
          <h6 class="font-medium uppercase text-xs">On This Page</h6>
          <ul class="">
            {contentHeadings.map(
              (h, i) =>
                h.level >= 2 &&
                h.level <= 3 && (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      class={[
                        'block my-4 text-[rgba(255,255,255,0.7)] hover:opacity-100 hover:text-primary-light ease-in-out',
                        `${h.level > 2 ? 'ml-4' : null}`,
                        activeHeadingIndex.value === i ? '!text-primary-light' : null,
                      ]}
                    >
                      {h.text}
                    </a>
                  </li>
                ),
            )}
          </ul>
        </>
      ) : null}

      <h6 class="font-medium uppercase text-xs mt-12">More options</h6>
      <ul>
        {OnThisPageMore.map((el, index) => {
          return (
            <li>
              <a
                class="flex gap-2 items-center my-4 hover:text-primary-light ease-in-out"
                href={el.href}
                rel="noopener"
                target="_blank"
              >
                <div class="text-2xl">
                  <el.icon />
                </div>
                <span>{el.text}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
});
