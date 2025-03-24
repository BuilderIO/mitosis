export const throwError = (message: string): never => {
  throw Error(`--- MITOSIS ERROR ---
    ${message}`);
};
