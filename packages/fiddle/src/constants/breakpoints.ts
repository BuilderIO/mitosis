const getBreakpointMediaQuery = (maxWidth: number) => `@media (max-width: ${maxWidth}px)`;

export const breakpoints = {
  sizes: {
    small: 700,
  },
  mediaQueries: {
    get small() {
      return getBreakpointMediaQuery(breakpoints.sizes.small);
    },
  },
};
