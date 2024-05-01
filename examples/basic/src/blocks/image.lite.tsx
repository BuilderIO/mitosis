import { Show } from '@builder.io/mitosis';

export interface ImageProps {
  classProp?: string;
  image: string;
  sizes?: string;
  lazy?: boolean;
  height?: number;
  width?: number;
  altText?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  srcset?: string;
  aspectRatio?: number;
  children?: any;
  fitContent?: boolean;
}

export default function Image(props: ImageProps) {
  return (
    <div css={{ position: 'relative' }}>
      <picture>
        <img
          loading="lazy"
          alt={props.altText}
          aria-role={props.altText ? 'presentation' : undefined}
          css={{
            opacity: '1',
            transition: 'opacity 0.2s ease-in-out',
            position: 'absolute',
            height: '100%',
            width: '100%',
            top: '0px',
            left: '0px',
          }}
          style={{
            objectPosition: props.backgroundSize || 'center',
            objectFit: (props.backgroundSize as any) || 'cover',
          }}
          class={'class-image' + (props.classProp ? ' ' + props.classProp : '')}
          src={props.image}
          // TODO: memoize on image on client
          srcset={props.srcset}
          sizes={props.sizes}
        />
        <source srcSet={props.srcset} />
      </picture>
      {props.aspectRatio && (
        <div
          style={{
            paddingTop: props.aspectRatio * 100 + '%',
          }}
          css={{
            width: '100%',
            pointerEvents: 'none',
            fontSize: '0',
          }}
        >
          {' '}
        </div>
      )}

      <Show when={!props.fitContent}>
        <div
          css={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
          }}
        >
          {props.children}
        </div>
      </Show>
    </div>
  );
}
