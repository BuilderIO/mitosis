import { BuilderElement } from '@builder.io/sdk';
import { component } from '../constants/components';
import { mapToAttributes } from '../functions/map-to-attributes';

export const RawImg = component({
  name: 'Raw:Img',
  noWrap: true,
  component: (block: BuilderElement, renderOptions, attributes) => {
    const { image, ...rest } = block.component!.options;
    // TODO: fix importing and read alt / srcset from attributes
    return ` <img src="${image}" ${mapToAttributes(rest)} ${attributes || ''} />`;
  },
});
