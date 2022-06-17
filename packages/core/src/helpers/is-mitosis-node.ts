import { MitosisNode } from '../types/mitosis-node';

export const isMitosisNode = (thing: unknown): thing is MitosisNode => {
  return Boolean(thing && (thing as any)['@type'] === '@builder.io/mitosis/node');
};
