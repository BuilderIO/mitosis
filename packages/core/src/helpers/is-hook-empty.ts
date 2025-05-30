import { BaseHook, OnMountHook } from '@/types/mitosis-component';

export const isHookEmpty = (hook?: BaseHook | BaseHook[] | OnMountHook[]): boolean => {
  if (!hook) {
    return true;
  }
  if (Array.isArray(hook)) {
    return hook.every((h) => isHookEmpty(h));
  }
  return !hook.code?.trim();
};
