export interface VideoProps {
  attributes?: any;
  video?: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  aspectRatio?: number;
  width?: number;
  height?: number;
  fit?: 'contain' | 'cover' | 'fill';
  position?:
    | 'center'
    | 'top'
    | 'left'
    | 'right'
    | 'bottom'
    | 'top left'
    | 'top right'
    | 'bottom left'
    | 'bottom right';
  posterImage?: string;
  lazyLoad?: boolean;
}

export default function Video(props: VideoProps) {
  return (
    <video
      {...props.attributes}
      style={{
        width: '100%',
        height: '100%',
        ...props.attributes?.style,
        objectFit: props.fit,
        objectPosition: props.position,
        // Hack to get object fit to work as expected and
        // not have the video overflow
        borderRadius: 1,
      }}
      preload="none"
      key={props.video || 'no-src'}
      poster={props.posterImage}
      autoPlay={props.autoPlay}
      muted={props.muted}
      controls={props.controls}
      loop={props.loop}
    />
  );
}
