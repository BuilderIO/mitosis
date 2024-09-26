export function minify(messageParts: TemplateStringsArray, ...expressions: readonly any[]): string {
  let text = '';
  for (let i = 0; i < messageParts.length; i++) {
    const part = messageParts[i];
    text += part;
    if (i < expressions.length) {
      text += expressions[i];
    }
  }

  return text
    .replace('\n', ' ')
    .replace(/^\s+/, '')
    .replace(/\s+$/, '')
    .replace(/\s+/g, ' ')
    .replace(/\s?([,;\:\-\{\}\(\)\<\>])\s?/g, (_, match) => match);
}
