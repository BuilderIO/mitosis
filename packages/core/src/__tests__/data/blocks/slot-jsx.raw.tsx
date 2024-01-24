import { Slot } from '../../../../dist/src';
import ContentSlotCode from './content-slot-jsx.raw';

type Props = { [key: string]: string };

export default function SlotCode(props: Props) {
  return (
    <div>
      <ContentSlotCode>
        <Slot content={<div>Hello {contentProps.stateName}</div>} />
      </ContentSlotCode>
      <ContentSlotCode>
        <Slot content={<ExampleComponent name={contentProps.stateName} />} />
      </ContentSlotCode>
    </div>
  );
}

export function ExampleComponent(props: Props) {
  return (
    <div>
      {props.name}
    </div>
  );
}
