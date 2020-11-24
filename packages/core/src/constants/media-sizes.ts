export type Size = 'large' | 'medium' | 'small';
export const sizeNames: Size[] = ['small', 'medium', 'large'];

export const sizes = {
  small: {
    min: 320,
    default: 321,
    max: 640,
  },
  medium: {
    min: 641,
    default: 642,
    max: 991,
  },
  large: {
    min: 990,
    default: 991,
    max: 1200,
  },
  getWidthForSize(size: Size) {
    return this[size].default;
  },
  getSizeForWidth(width: number) {
    for (const size of sizeNames) {
      const value = this[size];
      if (width <= value.max) {
        return size;
      }
    }
    return 'large';
  },
};

export const mediaQueryRegex = /@\s*?media\s*?\(\s*?max-width\s*?:\s*?(\d+)(px)\s*?\)\s*?/;
