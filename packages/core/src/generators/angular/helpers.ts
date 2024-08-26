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
  setAttributes: `setAttributes(el${isTs ? ': HTMLElement' : ''}, value${
    isTs ? ': any' : ''
  }, changes${isTs ? '?: any' : ''}) {
    if (!el) {
      return;
    }
    const target = typeof changes === 'undefined' ? value : changes;
    Object.keys(target).forEach((key) => {
      if (key.startsWith('on')) {
        if (this._listenerFns.has(key)) {
          this._listenerFns.get(key)();
        }
        this._listenerFns.set(key, this.renderer.listen(
          el,
          key.replace('on', '').toLowerCase(),
          target[key]
        ));
      } else {
        this.renderer.setAttribute(el, key, target[key] ?? '');
      }
    });
  }`,
});

export const getAppropriateTemplateFunctionKeys = (code: string) =>
  Object.keys(HELPER_FUNCTIONS()).filter((key) => code.includes(key));
