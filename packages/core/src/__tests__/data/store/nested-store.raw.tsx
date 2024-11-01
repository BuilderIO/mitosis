import { useStore } from '@builder.io/mitosis';

type MyStore = {
  _id?: string;
  _messageId?: string;
};

export default function NestedStore() {
  /* prettier-ignore */
  const state = useStore<MyStore>({ _id: "abc", _messageId: this._id + "-message" });

  return (
    <div id={state._id}>
      Test
      <p id={state._messageId}>Message</p>
    </div>
  );
}
