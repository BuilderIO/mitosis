import { Target } from '@builder.io/mitosis';

type Args = { target: Target } & (
  | {
      /**
       * Whether we are rendering an import statement or a filename.
       */
      type: 'import';
    }
  | {
      /**
       * Whether we are rendering an import statement or a filename.
       */
      type: 'filename';
      isTypescript: boolean;
    }
);

/**
 * Provides the correct file extension for a given component. This is used:
 *  - in `core` to render import statements within other components.
 *  - in `cli` to render filenames for generated components, and import statements within plain `.js`/`.ts` files.
 */
export const getComponentFileExtensionForTarget = (args: Args): string => {
  switch (args.target) {
    case 'angular':
      return '.ts';
    case 'alpine':
    case 'html':
      return '.html';
    case 'svelte':
      return '.svelte';
    case 'swift':
      return '.swift';
    case 'vue':
    case 'vue2':
    case 'vue3':
      return '.vue';
    case 'webcomponent':
      return '.ts';
    case 'lit':
      return '.ts';

    case 'qwik': {
      switch (args.type) {
        case 'import':
          return '.jsx';
        case 'filename':
          return args.isTypescript ? '.tsx' : '.jsx';
      }
    }
    case 'solid':
    case 'preact':
    case 'react':
    case 'reactNative':
    case 'rsc':
    case 'stencil':
      switch (args.type) {
        case 'import':
          // we can't have `.jsx`/`.tsx` extensions in the import paths, so we stick with implicit file extensions.
          return '';
        case 'filename':
          return args.isTypescript ? '.tsx' : '.jsx';
      }
    case 'marko':
      return '.marko';
    default:
      return '.js';
  }
};
