import glob from 'fast-glob';
import type { Stats } from 'fs';

/**
 * get all files that match `files` glob, and filter out those that match `exclude` glob.
 *
 */
export const getFiles = ({
  files,
  exclude,
}: {
  files: string | string[] | undefined;
  exclude: string[] | undefined;
}): string[] => {
  return files ? glob.sync(files, { ignore: exclude, onlyFiles: true, cwd: process.cwd() }) : [];
};

export const getFilesWithStats = ({
  files,
  exclude,
}: {
  files: string | string[] | undefined;
  exclude: string[] | undefined;
}): Array<{ path: string; stats: Stats }> => {
  if (!files) return [];
  const entries = glob.sync(files, {
    ignore: exclude,
    onlyFiles: true,
    cwd: process.cwd(),
    stats: true,
  });
  return entries.map((entry) => ({
    path: entry.path,
    stats: entry.stats!,
  }));
};
