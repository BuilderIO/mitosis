export function stripNewlinesInStrings(string: string) {
  const stringChar = '"';
  let inString = false;
  return string
    .split('')
    .map((char, index) => {
      if (inString) {
        if (char === '\n') {
          return ' ';
        }
      }

      if (
        char === stringChar &&
        !(string[index - 1] === '\\' && string[index - 2] !== '\\')
      ) {
        inString = !inString;
      }

      return char;
    })
    .join('');
}
