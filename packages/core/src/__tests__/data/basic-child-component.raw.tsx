import { useState } from '@builder.io/mitosis';
import MyBasicComponent from './basic.raw';
import MyBasicOnMountUpdateComponent from './basic-onMount-update.raw';

export default function MyBasicChildComponent() {
  const state = useState({
    name: 'Steve',
    dev: 'PatrickJS',
  });

  return (
    <div>
      {/*// @ts-ignore */}
      <MyBasicComponent id={state.dev} />
      <div>
        <MyBasicOnMountUpdateComponent hi={state.name} bye={state.dev} />
      </div>
    </div>
  );
}
