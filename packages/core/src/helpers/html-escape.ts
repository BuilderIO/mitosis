export function htmlAttributeEscape(value: string): string {
  return value.replace(/"/g, '&quot;').replace(/\n/g, '\\n');
}
