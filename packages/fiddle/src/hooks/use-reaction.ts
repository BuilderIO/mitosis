import { IReactionOptions, reaction } from 'mobx';
import { useEffect } from 'react';

export function useReaction<T = any>(
  expression: () => T,
  effect: (value: T) => void,
  options: IReactionOptions<T, boolean> = { fireImmediately: true },
): void {
  useEffect(() => reaction(expression, effect, options), []);
}
