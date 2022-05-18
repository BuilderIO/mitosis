import { useState } from '@builder.io/mitosis';
import MyBasicComponent from './basic.raw';
import MyBasicOnMountUpdateComponent from './basic-onMount-update.raw';

export default function MyBasicChildComponent() {
  const state = useState({
    name: 'Steve',
  });

  return (
    <div>
      <MyBasicComponent />
      <div>
        <MyBasicOnMountUpdateComponent />
      </div>
    </div>
  );
}
