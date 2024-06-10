export const HELPER_FUNCTIONS: {
  [key: string]: string;
} = {
  useObjectWrapper: `useObjectWrapper(...args: any[]) {
          let obj = {}
          args.forEach((arg) => {
            obj = { ...obj, ...arg };
          });
          return obj;
        }`,
  useObjectDotValues: `useObjectDotValues(obj: any): any[] {
          return Object.values(obj);
        }`,
  useTypeOf: `useTypeOf(obj: any): string {
          return typeof obj;
        }`,
  useJsonStringify: `useJsonStringify(obj: any): string {
          return JSON.stringify(obj);
        }`,
};

export const getAppropriateTemplateFunctionKeys = (code: string) =>
  Object.keys(HELPER_FUNCTIONS).filter((key) => code.includes(key));
