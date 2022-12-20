// TypeScript: augment babel core BaseNode interface to include _builder_meta

import BabelTypes from '@babel/types';
declare module '@babel/types' {
  interface BaseNode {
    _builder_meta?: {
      newlyGenerated?: boolean;
    };
  }
}
