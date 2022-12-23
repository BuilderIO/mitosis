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
    case 'react':
    case 'reactNative':
    case 'rsc':
      return isTs && type === 'filename' ? '.tsx' : '.jsx';
    case 'marko':
      return '.marko';
    default:
      return '.js';
  }
};
