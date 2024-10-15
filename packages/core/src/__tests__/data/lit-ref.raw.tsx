import { onMount, onUpdate, useRef, useStore } from '@builder.io/mitosis';

type Colors = {
  primary?: string;
  secondary?: string;
};

interface IconProps {
  icon: string;
  size?: 'xs' | 'md' | number;
  type?: 'solid' | 'line';
  ariaLabel?: string;
  color?: string;
  colorSecondary?: string;
}

export default function Icon(props: IconProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  const state = useStore({
    setColors(colors: Colors) {
      if (!hostRef) {
        return;
      }
      if (colors.primary) {
        hostRef.style.setProperty('--color-primary', colors.primary);
      } else {
        hostRef.style.removeProperty('--color-primary');
      }

      if (colors.secondary) {
        hostRef.style.setProperty('--color-secondary', colors.secondary);
      } else {
        hostRef.style.removeProperty('--color-secondary');
      }
    },
  });

  onMount(() => {
    state.setColors({
      primary: props.color,
      secondary: props.colorSecondary,
    });
  });

  onUpdate(() => {
    state.setColors({
      primary: props.color,
      secondary: props.colorSecondary,
    });
  }, [props.color, props.colorSecondary]);

  return (
    <div aria-label={props.ariaLabel} ref={hostRef}>
      <svg viewBox="0 0 24 24" fill="none"></svg>
    </div>
  );
}
