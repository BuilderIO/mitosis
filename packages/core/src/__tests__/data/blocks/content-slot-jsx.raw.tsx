/** @jsxImportSource @builder.io/mitosis */
import type { JSX } from '../../../jsx-types';

type Props = {
  [key: string]: string | JSX.Element;
};

export default function ContentSlotJsxCode(props: Props) {
  return (
    <div>
      {props.slotTesting}
      <div>
        <hr />
      </div>
      <div>{props.children}</div>
    </div>
  );
}
