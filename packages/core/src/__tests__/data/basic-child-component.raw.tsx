import { useStore } from '@builder.io/mitosis';
import MyBasicOnMountUpdateComponent from './basic-onMount-update.raw';
import MyBasicOutputsComponent from './basic-outputs.raw';
import MyBasicComponent from './basic.raw';

export default function MyBasicChildComponent() {
  const state = useStore({
    name: 'Steve',
    dev: 'PatrickJS',
  });

  function log(message: string) {
    console.log(message);
  }

  return (
    <div>
      <MyBasicComponent id={state.dev} />
      <div>
        <MyBasicOnMountUpdateComponent hi={state.name} bye={state.dev} />
        <MyBasicOutputsComponent
          message="Test"
          onMessageChange={(name) => (state.name = name)}
          onEvent={() => log('Test')}
        />
      </div>
    </div>
  );
}
