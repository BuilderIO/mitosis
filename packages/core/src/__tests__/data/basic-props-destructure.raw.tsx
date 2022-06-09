import { useState } from '@builder.io/mitosis';

// @ts-ignore
export default function MyBasicComponent({children: c, type}) {
  const state = useState({
    name: 'Steve',
  });

  return (
    <div>
      {c} {type}
      Hello! I can run in React, Vue, Solid, or Liquid!
    </div>
  );
}
