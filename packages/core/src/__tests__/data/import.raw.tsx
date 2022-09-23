import { default as Button1 } from './button'; // eslint-disable-line
import Button2 from './button'; // eslint-disable-line
import * as Button3 from './button'; // eslint-disable-line
import { Button } from './button'; // eslint-disable-line

export default function MyImportComponent() {
  return <div> Testing which imports get excluded! </div>;
}
