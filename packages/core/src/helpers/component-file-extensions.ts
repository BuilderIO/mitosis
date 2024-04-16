import { MitosisConfig, Target } from '@/types/config';
import { checkShouldOutputTypeScript } from './output';

const COMPONENT_EXTENSIONS = {
  jsx: ['.lite.tsx', '.lite.jsx'],
  svelte: ['.svelte'],
};

export const COMPONENT_IMPORT_EXTENSIONS = [COMPONENT_EXTENSIONS.svelte, COMPONENT_EXTENSIONS.jsx]
  .flat()
  .concat(['.lite']);

export const checkIsSvelteComponentFilePath = (filePath: string) =>
  COMPONENT_EXTENSIONS.svelte.some((x) => filePath.endsWith(x));

export const checkIsLiteComponentFilePath = (filePath: string) =>
  COMPONENT_EXTENSIONS.jsx.some((x) => filePath.endsWith(x));

export const checkIsMitosisComponentFilePath = (filePath: string) =>
  checkIsLiteComponentFilePath(filePath) || checkIsSvelteComponentFilePath(filePath);

/**
 * Matches `.svelte`, `.lite.tsx`, `.lite.jsx` files (with optional `.jsx`/`.tsx` extension)
 */
export const INPUT_EXTENSION_REGEX = /\.(svelte|(lite(\.tsx|\.jsx)?))/g;

export const renameComponentFile = ({
  path,
  target,
  options,
}: {
  path: string;
  target: Target;
  options: MitosisConfig;
}) =>
  path.replace(
    INPUT_EXTENSION_REGEX,
    getComponentFileExtensionForTarget({
      type: 'filename',
      target,
      isTypescript: checkShouldOutputTypeScript({ options, target }),
    }),
  );

/**
 * just like `INPUT_EXTENSION_REGEX`, but adds trailing quotes to the end of import paths.
 */
const INPUT_EXTENSION_IMPORT_REGEX = /\.(svelte|(lite(\.tsx|\.jsx)?))(?<quote>['"])/g;

export const renameComponentImport = ({
  importPath,
  target,
  explicitImportFileExtension,
}: {
  importPath: string;
  target: Target;
  explicitImportFileExtension: boolean;
}) => {
  return importPath.replace(
    INPUT_EXTENSION_IMPORT_REGEX,
    `${getComponentFileExtensionForTarget({
      type: 'import',
      target,
      explicitImportFileExtension,
    })}$4`,
  );
};

export const renameImport = ({
  importPath,
  target,
  explicitImportFileExtension,
}: {
  importPath: string;
  target: Target;
  explicitImportFileExtension: boolean;
}) => {
  return importPath.replace(
    /\.js(['"])/g,
    `${getFileExtensionForTarget({
      target,
      explicitImportFileExtension,
    })}$1`,
  );
};

type Args = { target: Target } & (
  | {
      /**
       * Whether we are rendering an import statement or a filename.
       */
      type: 'import';
      explicitImportFileExtension: boolean;
    }
  | {
      /**
       * Whether we are rendering an import statement or a filename.
       */
      type: 'filename';
      isTypescript: boolean;
    }
);

/**
 * Provides the correct file extension for a given component. This is used:
 *  - in `core` to render import statements within other components.
 *  - in `cli` to render filenames for generated components, and import statements within plain `.js`/`.ts` files.
 */
export const getComponentFileExtensionForTarget = (args: Args): string => {
  switch (args.target) {
    case 'angular': {
      switch (args.type) {
        case 'import':
          return '.js';
        case 'filename':
          return args.isTypescript ? '.ts' : '.js';
      }
    }
    case 'alpine':
    case 'html':
      return '.html';
    case 'svelte':
      return '.svelte';
    case 'swift':
      return '.swift';
    case 'vue':
      return '.vue';
    case 'webcomponent':
      return '.ts';
    case 'lit':
      return '.ts';

    case 'qwik': {
      switch (args.type) {
        case 'import':
          return '.jsx';
        case 'filename':
          return args.isTypescript ? '.tsx' : '.jsx';
      }
    }
    case 'solid':
    case 'preact':
    case 'react':
    case 'reactNative':
    case 'rsc':
    case 'stencil':
      switch (args.type) {
        case 'import':
          // we can't have `.jsx`/`.tsx` extensions in the import paths, so we stick with implicit file extensions.
          return args.explicitImportFileExtension ? '.js' : '';
        case 'filename':
          return args.isTypescript ? '.tsx' : '.jsx';
      }
    case 'marko':
      return '.marko';
    default:
      return '.js';
  }
};

export const getFileExtensionForTarget = ({
  target,
  explicitImportFileExtension,
}: {
  target: Target;
  explicitImportFileExtension: boolean;
}): string => {
  switch (target) {
    case 'angular':
    case 'alpine':
    case 'html':
    case 'svelte':
    case 'swift':
    case 'vue':
    case 'webcomponent':
    case 'lit':
    case 'qwik':
    case 'react':
    case 'reactNative':
    case 'rsc':
    case 'solid':
    case 'stencil':
    case 'marko':
    case 'preact':
    default:
      return explicitImportFileExtension ? '.js' : '';
  }
};
