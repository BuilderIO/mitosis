import { onInit, useStore } from '@builder.io/mitosis';

type Props = {
  name: string;
};

export const defaultValues = {
  name: 'PatrickJS',
};

export default function OnInit(props: Props) {
  const state = useStore({
    // name: props.name
    // name: defaultValues.name || props.name,
    name: '',
  });

  onInit(() => {
    state.name = defaultValues.name || props.name;
    console.log('set defaults with props');
  });

  return <div>Default name defined by parent {state.name}</div>;
}
