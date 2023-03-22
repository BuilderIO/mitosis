const propertiesThatMustBeNumber = new Set(['lineHeight']);
const displayValues = new Set(['flex', 'none']);

const SHOW_WARNINGS = false;

type Styles = Record<string, string | number>;

const normalizeNumber = (value: number): number | undefined => {
  if (Number.isNaN(value)) {
    return undefined;
  } else if (value < 0) {
    // TODO: why are negative values not allowed?
    return 0;
  } else {
    return value;
  }
};

export const sanitizeReactNativeBlockStyles = (styles: Styles): Styles => {
  return Object.keys(styles).reduce<Styles>((acc, key): Styles => {
    const propertyValue = styles[key];

    if (key === 'display' && !displayValues.has(propertyValue as string)) {
      if (SHOW_WARNINGS) {
        console.warn(
          `Style value for key "display" must be "flex" or "none" but had ${propertyValue}`
        );
      }
      return acc;
    }

    if (
      propertiesThatMustBeNumber.has(key) &&
      typeof propertyValue !== 'number'
    ) {
      if (SHOW_WARNINGS) {
        console.warn(
          `Style key ${key} must be a number, but had value \`${styles[key]}\``
        );
      }
      return acc;
    }

    if (typeof propertyValue === 'string') {
      // `px` units need to be stripped and replaced with numbers
      // https://regexr.com/6ualn
      const isPixelUnit = propertyValue.match(/^-?(\d*)(\.?)(\d*)*px$/);

      if (isPixelUnit) {
        const newValue = parseFloat(propertyValue);
        const normalizedValue = normalizeNumber(newValue);
        if (normalizedValue) {
          return { ...acc, [key]: normalizedValue };
        } else {
          return acc;
        }
      } else if (propertyValue === '0') {
        // 0 edge case needs to be handled
        return { ...acc, [key]: 0 };
      }
    }

    return { ...acc, [key]: propertyValue };
  }, {});
};
