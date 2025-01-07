import { useMetadata } from '@builder.io/mitosis';
import ComponentWithTypes from './component-with-types.lite';

useMetadata({
  docs: {
    name: 'This is the name',
  },
});

export default function AbcButton(props: any) {
  return <ComponentWithTypes name={props.name}></ComponentWithTypes>;
}
