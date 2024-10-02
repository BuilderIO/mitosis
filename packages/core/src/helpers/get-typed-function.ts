/**
 * Get functions with typescript typing
 */
export const getTypedFunction = (code: string, typescript?: boolean, typeParameter?: string) => {
  if (!typeParameter || !typescript) {
    return code;
  }

  const firstParenthesisIndex = code.indexOf('{');

  // The function should have at least one {
  if (firstParenthesisIndex < 0) {
    return code;
  }

  const preType = code.slice(0, firstParenthesisIndex - 1);
  const postType = code.slice(firstParenthesisIndex, code.length);

  return [preType, ': ', `ReturnType<${typeParameter}>`, postType].join('');
};
