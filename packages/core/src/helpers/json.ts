import json5 from 'json5';

type ParsedJson = any;

export const tryParseJson = (jsonStr: string): ParsedJson => {
  try {
    return json5.parse(jsonStr);
  } catch (err) {
    console.error('Could not JSON5 parse object:\n', jsonStr);
    throw err;
  }
};
