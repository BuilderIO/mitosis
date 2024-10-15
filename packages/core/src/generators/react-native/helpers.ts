import { extractCssVarDefaultValue } from './extract-css-var-default-value';

// Define types for React Native styles
type Styles = Record<string, string | number>;

type CSSPropertyValidator = (value: string) => boolean;

const lengthPattern = /^-?\d*\.?\d+(px|%)?$/;
const pixelPattern = /^-?\d*\.?\d+(px)?$/;
const numberPattern = /^-?\d*\.?\d+$/;
const colorPattern = /^(#[0-9A-Fa-f]{3,8}|(rgb|hsl)a?\(.*\)|[a-zA-Z]+)$/;

// List of unsupported properties in React Native
const unsupportedProps = [
  'textShadow',
  'boxShadow',
  'transition',
  'cursor',
  'filter',
  'overflowX',
  'overflowY',
  'animation',
  'backgroundImage',
  'backgroundPosition',
  'backgroundSize',
  'backgroundRepeat',
  'whiteSpace',
];

// Ensure CSS property value is valid for React Native
function validateReactNativeCssProperty(key: string, value: string | number): boolean {
  const cssProperties: Record<string, CSSPropertyValidator> = {
    width: (value) => lengthPattern.test(value),
    height: (value) => lengthPattern.test(value),
    backgroundColor: (value) => pixelPattern.test(value) || /^#[0-9A-Fa-f]{6}/.test(value),
    minWidth: (value: string) => lengthPattern.test(value) || value === 'auto',
    maxWidth: (value: string) => lengthPattern.test(value) || value === 'auto',
    minHeight: (value: string) => lengthPattern.test(value) || value === 'auto',
    maxHeight: (value: string) => lengthPattern.test(value) || value === 'auto',
    aspectRatio: (value: string) => numberPattern.test(value) || /^\d+\/\d+$/.test(value),

    // Flexbox Properties
    flex: (value: string) => numberPattern.test(value),
    flexBasis: (value: string) => lengthPattern.test(value) || value === 'auto',
    flexDirection: (value: string) =>
      ['row', 'row-reverse', 'column', 'column-reverse'].includes(value),
    flexGrow: (value: string) => numberPattern.test(value),
    flexShrink: (value: string) => numberPattern.test(value),
    flexWrap: (value: string) => ['wrap', 'nowrap', 'wrap-reverse'].includes(value),

    // Alignment Properties
    alignContent: (value: string) =>
      ['flex-start', 'flex-end', 'center', 'stretch', 'space-between', 'space-around'].includes(
        value,
      ),
    alignItems: (value: string) =>
      ['flex-start', 'flex-end', 'center', 'stretch', 'baseline'].includes(value),
    alignSelf: (value: string) =>
      ['auto', 'flex-start', 'flex-end', 'center', 'stretch', 'baseline'].includes(value),
    justifyContent: (value: string) =>
      [
        'flex-start',
        'flex-end',
        'center',
        'space-between',
        'space-around',
        'space-evenly',
      ].includes(value),

    // Text Properties
    color: (value: string) => colorPattern.test(value),
    fontFamily: () => true, // Any string is valid
    fontSize: (value: string) => pixelPattern.test(value),
    fontStyle: (value: string) => ['normal', 'italic'].includes(value),
    fontWeight: (value: string) =>
      ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'].includes(
        value,
      ),

    display: (value: string) => ['none', 'flex'].includes(value),
  };

  // If the property is not explicitly defined, consider it valid
  if (!cssProperties[key]) return true;

  // Convert number to string for validation
  const stringValue = typeof value === 'number' ? value.toString() : value;
  return cssProperties[key](stringValue);
}

// Clean up shorthand and unsupported styles for React Native
export function cleanReactNativeBlockStyles(styles: Styles): Styles {
  return Object.entries(styles).reduce<Styles>((acc, [key, value]) => {
    // Remove unsupported properties
    if (unsupportedProps.includes(key)) return acc;

    // Handle CSS variables
    if (typeof value === 'string' && value.includes('var(')) {
      value = extractCssVarDefaultValue(value) ?? value;
    }

    // Parse pixel units
    if (typeof value === 'string') {
      const pixelMatch = value.match(/^(-?\d+(\.\d+)?)px$/);
      if (pixelMatch) value = parseFloat(pixelMatch[1]);
    }

    // Handle shorthand properties
    if (key === 'margin' || key === 'padding') {
      return { ...acc, ...expandShorthand(key, value) };
    }

    // Convert 'background' to 'backgroundColor'
    if (key === 'background' && typeof value === 'string') {
      acc.backgroundColor = value;
      return { ...acc, backgroundColor: value };
    }

    // Handle borderRadius
    if (key === 'borderRadius' && typeof value === 'string') {
      return { ...acc, ...expandBorderRadius(value) };
    }

    // Handle invalid display values
    if (key === 'display' && value !== 'flex' && value !== 'none') {
      return acc;
    }

    // Validate and add the property
    if (validateReactNativeCssProperty(key, value)) {
      acc[key] = value;
    }

    return acc;
  }, {});
}

function expandShorthand(property: string, value: string | number): Styles {
  if (typeof value !== 'string') return { [property]: value };

  const values = value.split(' ').map((v) => parseFloat(v) || 0);
  const [top, right = top, bottom = top, left = right] = values;

  return {
    [`${property}Top`]: top,
    [`${property}Right`]: right,
    [`${property}Bottom`]: bottom,
    [`${property}Left`]: left,
  };
}

function expandBorderRadius(value: string): Styles {
  const values = value.split(' ').map((v) => parseInt(v, 10));
  const [topLeft, topRight = topLeft, bottomRight = topLeft, bottomLeft = topRight] = values;

  return {
    borderTopLeftRadius: topLeft,
    borderTopRightRadius: topRight,
    borderBottomRightRadius: bottomRight,
    borderBottomLeftRadius: bottomLeft,
  };
}
