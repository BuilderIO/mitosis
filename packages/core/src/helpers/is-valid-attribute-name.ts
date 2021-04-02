export const isValidAttributeName = (str: string) => {
  return Boolean(str && /^[a-z0-9\-_:]+$/i.test(str));
};
