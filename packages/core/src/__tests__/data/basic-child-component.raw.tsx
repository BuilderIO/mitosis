import { useStore } from '@builder.io/mitosis';
import MyBasicOnMountUpdateComponent from './basic-onMount-update.raw';
import MyBasicComponent from './basic.raw';

export default function MyBasicChildComponent() {
  const state = useStore({
    name: 'Steve',
    dev: 'PatrickJS',
  });

  return (
    <div>
      <MyBasicComponent id={state.dev} />
      <div>
        <MyBasicOnMountUpdateComponent hi={state.name} bye={state.dev} />
      </div>
    </div>
  );
}
