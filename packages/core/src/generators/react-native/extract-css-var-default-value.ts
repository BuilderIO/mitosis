export function extractCssVarDefaultValue(value: string): string {
  // Regular expression to find var() expressions
  const varRegex = /var\(--[^,]+?,\s*([^)]+)\)/;

  // Function to replace var() with its fallback
  let newValue = value;
  let match: string[] | null;
  while ((match = newValue.match(varRegex))) {
    newValue = newValue.replace(match[0], match[1].trim());
  }

  return newValue;
}
