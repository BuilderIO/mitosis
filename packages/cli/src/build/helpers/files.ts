import glob from 'fast-glob';

/**
 * get all files that match `files`glob, and filter out those that match `exclude` glob.
 *
 */
export const getFiles = ({
  files,
  exclude,
}: {
  files: string | string[];
  exclude: string[] | undefined;
}): string[] => {
  return glob.sync(files, { ignore: exclude, onlyFiles: true, cwd: process.cwd() });
};
