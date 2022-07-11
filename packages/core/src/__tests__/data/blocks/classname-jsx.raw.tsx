import { useStore } from '@builder.io/mitosis';
import type { JSX } from '../../../../jsx-runtime';

type Props = {
  [key: string]: string | JSX.Element;
  slotTesting: JSX.Element;
};

export default function ClassNameCode(props: Props) {
  const state = useStore({
    bindings: 'a binding',
  });

  return (
    <div>
      {/*// @ts-ignore */}
      <div className="no binding">Without Binding</div>
      {/*// @ts-ignore */}
      <div className={state.bindings}>With binding</div>
    </div>
  );
}
