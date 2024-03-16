import { Target } from '@builder.io/mitosis';
import { pathExists, readFile } from 'fs-extra';

const getOverrideFilenames = ({
  filename,
  target,
}: {
  filename: string;
  target: Target;
}): string[] => {
  switch (target) {
    case 'alpine':
    case 'angular':
    case 'customElement':
    case 'html':
    case 'liquid':
    case 'lit':
    case 'marko':
    case 'mitosis':
    case 'stencil':
    case 'svelte':
    case 'swift':
    case 'template':
    case 'webcomponent':
    case 'vue':
      return [filename];

    // For all JSX targets, we want to be flexible and allow any possible extension
    case 'react':
    case 'reactNative':
    case 'rsc':
    case 'preact':
    case 'solid':
    case 'qwik': {
      // strip 'tsx', 'ts', 'jsx', 'js' from filename
      const filenameStrippedFromExtensions = filename.replace(/(\.jsx?|\.tsx?)$/, '');

      const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];
      const filePaths: string[] = EXTENSIONS.map((ext) => filenameStrippedFromExtensions + ext);

      return filePaths;
    }

    default:
      return [filename];
  }
};
export const getOverrideFile = async ({
  path,
  filename,
  target,
}: {
  path: string;
  filename: string;
  target: Target;
}): Promise<string | null> => {
  const filePaths = getOverrideFilenames({ filename, target }).map((filename) =>
    [path, filename].join('/'),
  );

  const foundFilePath = (
    await Promise.all(
      filePaths.map(async (filePath) => ({ filePath, exists: await pathExists(filePath) })),
    )
  ).find(({ exists }) => exists);

  if (foundFilePath) {
    return readFile(foundFilePath.filePath, 'utf8');
  } else {
    return null;
  }
};
