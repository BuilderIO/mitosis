import { default as Button1 } from './blocks/button.raw'; // eslint-disable-line
import Button2 from './blocks/button.raw'; // eslint-disable-line
import * as Button3 from './blocks/button.raw'; // eslint-disable-line
import * as Button4 from './blocks/button.raw.lite'; // eslint-disable-line

export default function MyImportComponent() {
  return <div> Testing which imports get excluded! </div>;
}
