import { onInit } from '@builder.io/mitosis';

export default function OnInit() {
  onInit(() => {
    console.log('Runs once every update/rerender');
  });

  return <div />;
}
