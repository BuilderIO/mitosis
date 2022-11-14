/**
 * Similar to our `stableJSONSerialize` function, except that it does not stringify the values: it injects them as-is.
 * This is needed for our `MitosisState` values which are JS expressions stored as strings.
 */
export function stableInject(obj: any): string {
  const output: string[] = [];
  _serialize(output, obj);
  return output.join('');
}

function _serialize(output: string[], obj: any) {
  if (obj == null) {
    output.push('null');
  } else if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      output.push('[');
      let sep = '';
      for (let i = 0; i < obj.length; i++) {
        output.push(sep);
        _serialize(output, obj[i]);
        sep = ',';
      }
      output.push(']');
    } else {
      const keys = Object.keys(obj).sort();
      output.push('{');
      let sep = '';
      for (const key of keys) {
        const value = obj[key];
        if (value !== undefined) {
          output.push(sep);
          output.push(JSON.stringify(key));
          output.push(':');
          _serialize(output, value);
          sep = ',';
        }
      }
      output.push('}');
    }
  } else {
    output.push(obj);
  }
}
