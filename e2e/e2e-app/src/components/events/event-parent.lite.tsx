import { useState, useStore } from '@builder.io/mitosis';
import EventChild from './event-child.lite';

export default function EventParent() {
  const [eventLog, setEventLog] = useState<string>('');

  const state = useStore({
    _onCancel() {
      const newEventLog = eventLog + 'Cancel event called <br>';
      setEventLog(newEventLog);
    },

    _onConfirm(name: string) {
      const newEventLog = eventLog + `Confirm event called with parameter: ${name} <br>`;
      setEventLog(newEventLog);
    },
  });

  return (
    <>
      <EventChild
        onConfirm={(name) => state._onConfirm(name)}
        onCancel={() => state._onCancel()}
      ></EventChild>
      <p data-testid="event-log" innerHTML={eventLog}></p>
    </>
  );
}
