import { Signal, onUpdate } from '@builder.io/mitosis';

type Props = {
  id: Signal<string>;
  foo: Signal<{
    bar: {
      baz: number;
    };
  }>;
};

export default function MyBasicComponent(props: Props) {
  onUpdate(() => {
    console.log('props.id changed', props.id);
    console.log('props.foo.value.bar.baz changed', props.foo.value.bar.baz);
  }, [props.id, props.foo.value.bar.baz]);

  return (
    <div
      class="test"
      css={{
        padding: '10px',
      }}
    >
      {props.id}
      {props.foo.value.bar.baz}
    </div>
  );
}
