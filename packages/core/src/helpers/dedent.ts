// Based on "dedent" package
// Latest commit 2381e76 on Feb 15, 2017
// Source: https://raw.githubusercontent.com/dmnd/dedent/master/dedent.js
// License: MIT
// Updates:
// 1. Converted to TypeScript
// 2. Preserve whitespace inside backtick string literals

export function dedent(strings: TemplateStringsArray, ...values: any[]): string {
  const raw = typeof strings === 'string' ? [strings] : strings.raw;

  // first, perform interpolation
  let result = '';
  for (let i = 0; i < raw.length; i++) {
    result += raw[i]
      // join lines when there is a suppressed newline
      .replace(/\\\n[ \t]*/g, '')
      // handle escaped backticks
      .replace(/\\`/g, '`');

    if (i < values.length) {
      result += values[i];
    }
  }

  // now strip indentation
  const lines = split(result);
  let mindent: number | null = null;
  lines.forEach((l) => {
    let m = l.match(/^(\s+)\S+/);
    if (m) {
      let indent = m[1].length;
      if (!mindent) {
        // this is the first indented line
        mindent = indent;
      } else {
        mindent = Math.min(mindent, indent);
      }
    }
  });

  if (mindent !== null) {
    const m = mindent;
    result = lines.map((l) => (l[0] === ' ' ? l.slice(m) : l)).join('\n');
  }

  // trim trailing whitespace on all lines
  result = result
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n');

  return (
    result
      // dedent eats leading and trailing whitespace too
      .trim()
      // handle escaped newlines at the end to ensure they don't get stripped too
      .replace(/\\n/g, '\n')
  );
}

/**
 * Splits a string by newlines.
 * Preserve whitespace inside backtick string literals.
 * @param input The original input string.
 * @returns The split string.
 */
function split(input: string): string[] {
  const result: string[] = [];
  let prev = '';
  let current = '';
  let inBackticks = false;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (prev !== '\\' && char === '`') {
      inBackticks = !inBackticks;
    }
    if (!inBackticks && char === '\n') {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
    prev = char;
  }
  return result;
}
