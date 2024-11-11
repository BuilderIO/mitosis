import { ComponentMetadata } from '@builder.io/mitosis';
import { customMetaData } from '../shared/data';

export const metadata: ComponentMetadata = {
  regularKey: 'abc',
  'some-key': customMetaData,
  react: {
    forwardRef: 'xxx',
  },
  vue: {
    customKey: 'yyy',
  },
};
