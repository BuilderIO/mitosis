import { JSONObject } from 'src/types/json';
import { MitosisComponent } from '..';

export const propTypesToJson = (
  props: string[], // collected props
  json: MitosisComponent,
  strip = true, // strip the prop types from json.types after collecting them
): JSONObject => {
  let obj: JSONObject = {};

  if (json.types?.length && json.propsTypeRef) {
    let propTypeIndex = json.types.findIndex((t: string) => t.indexOf(`${json.propsTypeRef} =`));
    if (propTypeIndex >= 0) {
      let propTypes = strip
        ? json.types.splice(propTypeIndex, 1)
        : json.types.slice(propTypeIndex, 1);
      props.forEach((prop) => {
        let regexp = new RegExp(`(?<=${prop}[\?]*: )(.*?)(?=\;)`);
        const matches = propTypes[0].match(regexp);
        if (matches?.length) {
          obj[prop] = matches[0];
        }
      });
    }
  }

  return obj;
};
