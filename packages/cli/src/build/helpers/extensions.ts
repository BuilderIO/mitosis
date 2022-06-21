import { Target } from '@builder.io/mitosis';

export const getFileExtensionForTarget = (target: Target) => {
  switch (target) {
    case 'vue':
    case 'vue2':
    case 'vue3':
      return '.vue';
    case 'swift':
      return '.swift';
    case 'svelte':
      return '.svelte';
    case 'solid':
      return '.jsx';
    default:
      return '.js';
  }
};
