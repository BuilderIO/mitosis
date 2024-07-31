import { useStore } from '@builder.io/mitosis';
import { clsx } from 'clsx';

type ButtonType = 'primary' | 'secondary';

interface ButtonProps {
  type: ButtonType;
  onClick: () => void;
  children: any;
}

export default function Button(props: ButtonProps) {
  const state = useStore({
    get buttonClasses() {
      return clsx('px-4 py-2 rounded transition-colors', {
        'bg-blue-500 hover:bg-blue-600 text-white': props.type === 'primary',
        'bg-gray-300 hover:bg-gray-400 text-black': props.type === 'secondary',
      });
    },
  });

  return (
    <button class={state.buttonClasses} onClick={props.onClick}>
      {props.children}
    </button>
  );
}
