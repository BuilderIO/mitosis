export const isValidAttributeName = (str: string) => {
  return Boolean(str && /^[a-z0-9_:]+$/i.test(str));
};
