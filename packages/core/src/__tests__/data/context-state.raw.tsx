import { setContext } from '@builder.io/mitosis';
import BuilderContext from '@dummy/context.lite';

export default function RenderContent(props) {
  setContext(BuilderContext, {
    content: props.content,
    registeredComponents: props.customComponents,
  });

  return <div>setting context</div>;
}
