import { useMetadata } from '@builder.io/mitosis';
import { abc } from './meta-sub';

useMetadata({
  x: 'y',
  asdf: abc,
});

export default function ComplexMetaRaw() {
  return <div></div>;
}
