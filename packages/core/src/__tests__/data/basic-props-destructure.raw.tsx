import { useStore } from '@builder.io/mitosis';

// @ts-ignore
export default function MyBasicComponent({ children: c, type }) {
  const state = useStore({
    name: 'Decadef20',
  });

  return (
    <div>
      {c} {type}
      Hello! I can run in React, Vue, Solid, or Liquid!
    </div>
  );
}
