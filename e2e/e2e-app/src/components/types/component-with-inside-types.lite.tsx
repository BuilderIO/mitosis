import { useDefaultProps } from '@builder.io/mitosis';

export type Props = {
  name: string;
};

useDefaultProps<Props>({
  name: 'Sami',
});

export default function ComponentWithInsideTypes(props: Props) {
  return <div> Hello {props.name}</div>;
}
