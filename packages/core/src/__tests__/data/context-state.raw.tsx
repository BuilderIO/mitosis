import { setContext } from '@builder.io/mitosis';
import BuilderContext from '@dummy/context.lite';

export default function RenderContent(props) {
  setContext(BuilderContext, {
    content: props.content,
    registeredComponents: props.customComponents,
    foo: {
      bar: 'baz',
      baz: 123,
      fn: () => {
        const a = 1;
        return 'hello' + 'world' + a;
      },
    },
  });

  return <div>setting context</div>;
}
