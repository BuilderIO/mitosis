import { default as Button1 } from './button';
import Button2 from './button';
import * as Button3 from './button';
import { Button } from './button';

export default function MyImportComponent() {
  return <div> Testing which imports get excluded! </div>;
}
