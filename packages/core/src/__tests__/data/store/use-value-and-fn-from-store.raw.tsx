import { onUpdate, useStore } from '@builder.io/mitosis';

type MyProps = {
  onChange?: (active: boolean) => void;
};

type MyStore = {
  _id?: string;
  _active?: boolean;
  _do?: (id?: string) => void;
};

export default function UseValueAndFnFromStore(props: MyProps) {
  const state = useStore<MyStore>({
    _id: 'abc',
    _active: false,
    _do: (id?: string) => {
      this._active = !!id;
      if (props.onChange) {
        props.onChange(this._active);
      }
    },
  });

  onUpdate(() => {
    if (state._do) {
      state._do(state._id);
    }
  });

  return <div>Test</div>;
}
