import { Target } from '@builder.io/mitosis';

export const getFileExtensionForTarget = (target: Target) => {
  switch (target) {
    case 'angular':
      return '.ts';
    case 'html':
      return '.html';
    case 'solid':
      return '.jsx';
    case 'svelte':
      return '.svelte';
    case 'swift':
      return '.swift';
    case 'vue':
      return '.vue';
    case 'webcomponent':
      return '.ts';
    default:
      return '.js';
  }
};
