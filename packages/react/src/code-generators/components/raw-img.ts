import { BuilderElement } from '@builder.io/sdk';
import { component } from '../constants/components';
import { mapToAttributes } from '../functions/map-to-attributes';

export const RawImg = component({
  name: 'Raw:Img',
  noWrap: true,
  component: (block: BuilderElement) => {
    const { image, ...rest } = block.component!.options;
    // TODO: handle bindings in mapToAttributes
    return ` <img src="${image}" ${mapToAttributes(rest)} ${mapToAttributes(block.properties)} />`;
  },
});
