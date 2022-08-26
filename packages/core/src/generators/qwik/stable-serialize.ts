/**
 * Same as JSON.stringify, but sorts keys ensuring that the output is stable across runs.
 * @param obj
 * @returns JSON serialized string
 */
export function stableJSONserialize(obj: any): string {
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
    output.push(JSON.stringify(obj));
  }
}
