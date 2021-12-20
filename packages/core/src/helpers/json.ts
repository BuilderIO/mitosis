import json5 from 'json5';

export const tryParseJson = (jsonStr: string) => {
  try {
    return json5.parse(jsonStr);
  } catch (err) {
    console.error('Could not JSON5 parse object:\n', jsonStr);
    throw err;
  }
};
