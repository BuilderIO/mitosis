const preSpaceRegex = /^\s*/g;

const DEFAULT_INDENT_SPACES = 2;

/**
 * Generic formatter for languages prettier doesn't support, like Swift
 *
 * Not super sophisticated, but much better than nothing
 */
export const format = (str: string, indentSpaces = DEFAULT_INDENT_SPACES) => {
  let currentIndent = 0;
  const lines = str.split('\n');
  lines.forEach((item, index) => {
    item = item.trimEnd();

    if (!item) {
      lines[index] = '';
      return;
    }

    lines[index] = item.replace(preSpaceRegex, ' '.repeat(currentIndent * indentSpaces));

    const nextLine = lines[index + 1];
    if (!nextLine) {
      return;
    }

    if (nextLine.match(/^\s*[})][,;]?\s*$/)) {
      currentIndent--;
    } else if (item.match(/([({]| in)$/)) {
      currentIndent++;
    }

    currentIndent = Math.max(currentIndent, 0);
  });
  return lines.join('\n').replace(/\n{3,}/g, '\n\n');
};
