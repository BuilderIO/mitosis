import { MitosisConfig, Target } from '@builder.io/mitosis';

export const getFileExtensionForTarget = ({
  type,
  target,
  options,
}: {
  type: 'import' | 'filename';
  target: Target;
  options: MitosisConfig;
}): string => {
  const isTs = !!options.options[target]?.typescript;
  switch (target) {
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

    // all JSX frameworks
    case 'solid':
    case 'qwik':
    case 'react':
    case 'reactNative':
    case 'rsc':
    case 'stencil':
      switch (type) {
        case 'import':
          // we can't have `.jsx`/`.tsx` extensions in the import paths, so we stick with implicit file extensions.
          return '';
        case 'filename':
          return isTs ? '.tsx' : '.jsx';
      }
    case 'marko':
      return '.marko';
    default:
      return '.js';
  }
};
