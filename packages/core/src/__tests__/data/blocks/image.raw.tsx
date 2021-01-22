import {
  useState,
  useRef,
  onMount,
  onUnMount,
  Fragment,
  Show,
} from '@jsx-lite/core';

export interface ImageProps {
  image: string;
  sizes: number[];
  lazy: boolean;
  srcset: string;
  height?: number;
  width?: number;
  altText?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  className?: string;
  // TODO: Implement support for custom aspect ratios
  aspectRatio?: number;
  children?: any;
}

export default function Image(props: ImageProps) {
  const pictureRef = useRef();

  const state = useState({
    scrollListener: null,
    imageLoaded: false,
    load: false,
    setLoaded() {
      state.imageLoaded = true;
    },
    isBrowser() {
      return (
        typeof window !== 'undefined' &&
        window.navigator.product != 'ReactNative'
      );
    },
    useLazyLoading() {
      // TODO: Add more checks here, like testing for real web browsers
      return !!props.lazy && state.isBrowser();
    },
  });

  onMount(() => {
    if (state.useLazyLoading()) {
      // throttled scroll capture listener
      const listener = () => {
        if (pictureRef) {
          const rect = pictureRef.getBoundingClientRect();
          const buffer = window.innerHeight / 2;
          if (rect.top < window.innerHeight + buffer) {
            state.load = true;
            state.scrollListener = null;
            window.removeEventListener('scroll', listener);
          }
        }
      };
      state.scrollListener = listener;
      window.addEventListener('scroll', listener, {
        capture: true,
        passive: true,
      });
      listener();
    }
  });

  onUnMount(() => {
    if (state.scrollListener) {
      window.removeEventListener('scroll', state.scrollListener);
    }
  });

  return (
    <Fragment>
      <picture ref={pictureRef}>
        <Show when={!state.useLazyLoading() || state.load}>
          <img
            alt={props.altText}
            role={props.altText ? 'presentation' : undefined}
            css={{
              opacity: 1,
              transition: 'opacity 0.2s ease-in-out',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            className={
              'builder-image' + (props.className ? ' ' + props.className : '')
            }
            src={props.image}
            onLoad={state.setLoaded}
            // TODO: memoize on image on client
            srcSet={props.srcset}
            sizes={props.sizes}
          />
        </Show>
        <source srcSet={props.srcset} />
      </picture>
      {props.children}
    </Fragment>
  );
}
