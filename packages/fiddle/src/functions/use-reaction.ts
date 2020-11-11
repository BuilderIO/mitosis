import { IReactionOptions, reaction } from 'mobx';
import { useEffect } from 'react';

export function useReaction<T = any>(
  expression: () => T,
  effect: (value: T) => void,
  options: IReactionOptions = { fireImmediately: true },
): void {
  useEffect(() => reaction(expression, effect, options), []);
}
