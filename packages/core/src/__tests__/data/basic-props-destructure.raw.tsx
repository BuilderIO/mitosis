import { useStore } from '@builder.io/mitosis';

type Props = {
  type: string;
  children: any;
};

export default function MyBasicComponent({ children: c, type }: Props) {
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
