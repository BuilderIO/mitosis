import { CssSelector } from '@angular/compiler';

export function parse(selector: string) {
  const { element, classNames, attrs } = CssSelector.parse(selector)[0];
  const attributes = attrs.reduce((acc, attr, i) => {
    if (i % 2 === 0) {
      acc[attr] = attrs[i + 1];
    }
    return acc;
  }, {} as Record<string, string>);

  return {
    element,
    classNames,
    attributes,
  };
}
