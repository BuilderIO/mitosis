export function indent(str: string, spaces = 4) {
  return str.replace(/\n([^\n])/g, `\n${' '.repeat(spaces)}$1`);
}
