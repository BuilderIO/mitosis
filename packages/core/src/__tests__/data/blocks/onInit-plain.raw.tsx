import { onInit } from '@builder.io/mitosis';

export default function OnInitPlain() {
  onInit(() => {
    console.log('onInit');
  });

  return <div />;
}
