export interface ImageProps {
  pictureAttributes?: any;
  imageAttributes?: any;
  altText?: string;
  imageSrc?: string;
  srcSet?: string;
}

export default function Image(props: ImageProps) {
  return (
    <picture {...props.pictureAttributes}>
      <img {...props.imageAttributes} alt={props.altText} src={props.imageSrc} srcset={props.srcSet} />
    </picture>
  );
}
