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
    case 'vue2':
    case 'vue3':
      return '.vue';
    case 'webcomponent':
      return '.ts';
    case 'lit':
      return '.ts';
    case 'qwik':
      return '.jsx';
    case 'marko':
      return '.marko';
    default:
      return '.js';
  }
};
