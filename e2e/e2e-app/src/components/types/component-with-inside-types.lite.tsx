export type Props = {
  name: string;
};

const DEFAULT_VALUES: Props = {
  name: 'Sami',
};

export default function ComponentWithInsideTypes(props: Props) {
  return <div> Hello {props.name || DEFAULT_VALUES.name}</div>;
}
