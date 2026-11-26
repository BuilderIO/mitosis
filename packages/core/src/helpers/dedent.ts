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

  // dedent eats leading and trailing whitespace too
  result = result.trim();

  // Handle escaped newlines at the end to ensure they don't get stripped too.
  // Only convert `\n` escape sequences that appear outside of string literals:
  // inside a string, the two-character escape sequence is meaningful code
  // (e.g. `split("\n")`) and must be preserved as-is, otherwise the generated
  // code ends up with a literal line break inside the string (#1064).
  return unescapeNewlinesOutsideStrings(result);
}

/**
 * Converts literal `\n` escape sequences into actual newline characters,
 * except inside string literals ('...', "..." and `...`), where the escape
 * sequence is preserved verbatim.
 * @param input The original input string.
 * @returns The string with escaped newlines converted outside of strings.
 */
function unescapeNewlinesOutsideStrings(input: string): string {
  let result = '';
  let inString: string | null = null;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inString) {
      result += char;
      if (char === '\\' && i + 1 < input.length) {
        // copy the escaped character verbatim
        result += input[i + 1];
        i++;
      } else if (char === inString) {
        inString = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      inString = char;
      result += char;
      continue;
    }

    if (char === '\\' && input[i + 1] === 'n') {
      result += '\n';
      i++;
      continue;
    }

    result += char;
  }

  return result;
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
