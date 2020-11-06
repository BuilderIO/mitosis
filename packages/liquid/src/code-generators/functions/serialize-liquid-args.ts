export function serializeLiquidArgs(data?: Record<string, any>) {
  const argStrings: string[] = [];
  if (data) {
    for (const key in data) {
      const value = data[key];
      // Key must be just letters, numbers, _
      if (/^[a-z_0-9]+$/i.test(key)) {
        // For now just support boolean, number, string
        if (['boolean', 'number', 'string'].includes(typeof value)) {
          const json = JSON.stringify(
            typeof value === 'string' ? value.replace(/"/g, '&quot;') : value
          );
          argStrings.push(`${key}: ${json}`);
        }
      }
    }
  }
  return argStrings.join(', ');
}
