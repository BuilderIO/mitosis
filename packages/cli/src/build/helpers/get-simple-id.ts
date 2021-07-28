export function getSimpleId() {
  return Number(String(Math.random()).split('.')[1]).toString(36);
}
