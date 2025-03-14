import { useStore } from '@builder.io/mitosis';
import { EventProps, EventState } from './event-props.type';

export default function EventPropsComponent(props: EventProps) {
  const state = useStore<EventState>({
    handleClick: () => {
      if (props.onGetVoid) {
        props.onGetVoid();
      }
      if (props.onEnter) {
        console.log(props.onEnter());
      }
    },
  });

  return <button onClick={() => state.handleClick()}>Test</button>;
}
