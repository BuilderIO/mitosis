export const HELPER_FUNCTIONS = (
  isTs?: boolean,
): {
  [key: string]: string;
} => ({
  useObjectWrapper: `useObjectWrapper(...args${isTs ? ': any[]' : ''}) {
    let obj = {}
    args.forEach((arg) => {
      obj = { ...obj, ...arg };
    });
    return obj;
  }`,
  useObjectDotValues: `useObjectDotValues(obj${isTs ? ': any' : ''})${isTs ? ': any[]' : ''}) {
    return Object.values(obj);
  }`,
  useTypeOf: `useTypeOf(obj${isTs ? ': any' : ''})${isTs ? ': string' : ''}) {
    return typeof obj;
  }`,
  useJsonStringify: `useJsonStringify(...args${isTs ? ': any' : ''})${isTs ? ': string' : ''}) {
    return JSON.stringify(...args);
  }`,
  setAttributes: `
    setAttributes(el${isTs ? ': HTMLElement' : ''}, value${isTs ? ': any' : ''}) {
      if (!el) {
        return;
      }
      Object.keys(value).forEach((key) => {
        if (key.startsWith('on')) {
          this._listenerFns.push(this.renderer.listen(
            el,
            key.replace('on', '').toLowerCase(),
            value[key]
          ));
        } else {
          this.renderer.setAttribute(el, key, value[key] ?? '');
        }
      });
    }
`,
});

export const getAppropriateTemplateFunctionKeys = (code: string) =>
  Object.keys(HELPER_FUNCTIONS()).filter((key) => code.includes(key));
