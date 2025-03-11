import { useMetadata } from '@builder.io/mitosis';

type Props = {
  children: any;
  className: string;
  type: string;
};

useMetadata({
  stencil: {
    propOptions: {
      className: {
        attribute: 'classname',
        mutable: false,
        reflect: false,
      },
    },
  },
});

export default function MyBasicComponent(props: Props) {
  return (
    <div class={props.className}>
      {props.children} {props.type}
      Hello! I can run in React, Vue, Solid, or Liquid!
    </div>
  );
}
