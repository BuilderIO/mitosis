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
    case 'solid':
      return '.jsx';
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
    case 'qwik':
      return isTs && type === 'filename' ? '.tsx' : '.jsx';
    case 'react':
    case 'reactNative':
    case 'rsc':
      switch (type) {
        // we can't have `.jsx`/`.tsx` extensions in the import paths.
        case 'import':
          return isTs ? '.ts' : '.js';
        case 'filename':
          return isTs ? '.tsx' : '.jsx';
      }
    case 'marko':
      return '.marko';
    default:
      return '.js';
  }
};
