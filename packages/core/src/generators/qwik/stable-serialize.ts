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
  if (obj && typeof obj === 'object') {
    const keys = Object.keys(obj).sort();
    output.push('{');
    let sep = '';
    for (const key of keys) {
      const value = JSON.stringify(key);
      if (value !== undefined) {
        output.push(sep);
        output.push(value);
        output.push(':');
        _serialize(output, obj[key]);
        sep = ',';
      }
    }
    output.push('}');
  } else {
    output.push(JSON.stringify(obj));
  }
}
