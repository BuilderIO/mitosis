/**
 * Minimal implementation of lodash's _.set
 * https://lodash.com/docs/4.17.15#set
 *
 * See ./set.test.ts for usage examples
 */
export const set = (obj: any, _path: string | string[], value: any) => {
  if (Object(obj) !== obj) {
    return obj;
  }
  const path: string[] = Array.isArray(_path)
    ? _path
    : (_path.toString().match(/[^.[\]]+/g) as string[]);

  path
    .slice(0, -1)
    .reduce(
      (a, c, i) =>
        Object(a[c]) === a[c]
          ? a[c]
          : (a[c] = Math.abs(Number(path[i + 1])) >> 0 === +path[i + 1] ? [] : {}),
      obj,
    )[path[path.length - 1]] = value;
  return obj;
};
