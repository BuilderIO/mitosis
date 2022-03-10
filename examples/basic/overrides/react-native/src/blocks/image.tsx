import { Image as ReactImage, View } from 'react-native';

// Subset of Image props, many are irrelevant for native (such as altText, etc)
export interface ImageProps {
  image: string;
  backgroundSize?: 'cover' | 'contain';
  backgroundPosition?: string;
  aspectRatio?: number;
  width?: number;
  height?: number;
}

export default function Image(props: ImageProps) {
  return props.aspectRatio ? (
    <View style={{ position: 'relative' }}>
      <ReactImage
        resizeMode={props.backgroundSize || 'contain'}
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
        source={{ uri: props.image }}
      />
      <View
        style={{
          width: '100%',
          paddingTop: props.aspectRatio * 100 + '%',
        }}
      />
    </View>
  ) : (
    <ReactImage
      resizeMode={props.backgroundSize || 'contain'}
      style={{
        position: 'relative',
        ...(props.width ? { width: props.width } : {}),
        ...(props.height ? { height: props.height } : {}),
      }}
      source={{ uri: props.image }}
    />
  );
}
