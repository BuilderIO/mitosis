import { useMetadata } from '@builder.io/mitosis';
import { metadata } from './data';

useMetadata({ ...metadata });

export default function MetadataExample() {
  return <div>Metadata</div>;
}
