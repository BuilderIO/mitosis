/** @jsxImportSource @builder.io/mitosis */

import { Slot } from '@builder.io/mitosis';
import type { JSX } from '../../../jsx-types';

type Props = {
  [key: string]: string | JSX.Element;
  slotTesting: JSX.Element;
};

export default function ContentSlotCode(props: Props) {
  return (
    <div>
      <Slot name={props.slotTesting} />
      <div>
        <hr />
      </div>
      <div>
        <Slot />
      </div>
    </div>
  );
}
