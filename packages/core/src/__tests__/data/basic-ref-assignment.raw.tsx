import { useState, useRef } from '@builder.io/mitosis';

export interface Props {
  showInput: boolean;
}

export default function MyBasicRefAssignmentComponent(props: Props) {
  let holdValueRef = useRef('Patrick');

  function handlerClick(event: Event) {
    event.preventDefault();
    console.log('current value', holdValueRef);
    holdValueRef = holdValueRef + 'JS';
  }

  return (
    <div>
      <button onClick={(evt) => handlerClick(evt)}>Click</button>
    </div>
  );
}
