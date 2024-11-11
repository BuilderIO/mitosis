import { mapImportDeclarationToMitosisImport } from '@/helpers/mitosis-imports';
import { babelDefaultTransform, babelStripTypes, parseCodeJson } from '@/parsers/jsx/helpers';
import { Context, ParseMitosisOptions } from '@/parsers/jsx/types';
import { MitosisImport } from '@/types/mitosis-component';
import * as babel from '@babel/core';
import { NodePath } from '@babel/core';
import { existsSync, readFileSync } from 'fs-extra-promise';
import * as path from 'path';

type ResolveData = {
  nodePath: NodePath<babel.types.Program>;
  currentFilePath?: string;
};

const getCodeFromImport = (
  importObject: MitosisImport,
  currentFile?: string,
): { code?: string; typescript?: boolean; importFile?: string } => {
  if (currentFile) {
    // resolve path of import
    const absolutePathArray = currentFile.replaceAll('\\', '/').replaceAll('/./', '/').split('/');
    const originFile = absolutePathArray.pop();
    const typescript = !!originFile?.includes('.ts');
    const importFile =
      importObject.path.endsWith('.ts') || importObject.path.endsWith('.js')
        ? importObject.path
        : `${importObject.path}.${typescript ? 'ts' : 'js'}`;
    const importFilePath = path.resolve(absolutePathArray.join('/'), importFile);
    if (existsSync(importFilePath)) {
      return { code: readFileSync(importFilePath).toString(), typescript, importFile };
    }
    return { typescript };
  }

  return {};
};

const fillDeclarations = ({
  declaration,
  valueToResolve,
  currentFilePath,
  nodePath,
}: {
  declaration: babel.types.VariableDeclaration;
  valueToResolve: string;
} & ResolveData): Record<string, any> => {
  let result = {};
  for (const variable of declaration.declarations) {
    if (babel.types.isIdentifier(variable.id)) {
      if (variable.id.name === valueToResolve && variable.init) {
        const filled = resolveObjectsRecursive({
          node: variable.init,
          nodePath,
          currentFilePath,
        });

        result = {
          ...result,
          ...filled,
        };
      }
    }
  }
  return result;
};

const resolve = ({
  nodePath,
  currentFilePath,
  valueToResolve,
}: ResolveData & { valueToResolve: string }): Record<string, any> => {
  let result = {};
  const programNodes = nodePath.node.body;
  for (const statement of programNodes) {
    if (babel.types.isImportDeclaration(statement)) {
      const importObject = mapImportDeclarationToMitosisImport(statement);

      if (Object.keys(importObject.imports).includes(valueToResolve)) {
        // In this case the variable was imported
        const { code, typescript, importFile } = getCodeFromImport(importObject, currentFilePath);
        if (code) {
          const jsxToUse = babelStripTypes(code, typescript);

          babelDefaultTransform(jsxToUse, {
            Program(path) {
              const statements: babel.types.Statement[] = path.node.body;
              for (const pStatement of statements) {
                if (babel.types.isExportNamedDeclaration(pStatement)) {
                  const declaration = pStatement.declaration;
                  if (babel.types.isVariableDeclaration(declaration)) {
                    const filledDeclaration = fillDeclarations({
                      declaration,
                      valueToResolve,
                      currentFilePath: importFile,
                      nodePath: path,
                    });
                    result = {
                      ...result,
                      ...filledDeclaration,
                    };
                  }
                }
              }
            },
          });
        }
      }
    } else if (babel.types.isVariableDeclaration(statement)) {
      // In this case the variable is inside the same file
      const filledDeclaration = fillDeclarations({
        declaration: statement,
        valueToResolve,
        currentFilePath,
        nodePath,
      });
      result = {
        ...result,
        ...filledDeclaration,
      };
    }
  }

  return result;
};

const resolveObjectsRecursive = ({
  node,
  nodePath,
  currentFilePath,
}: {
  node: babel.types.Node;
} & ResolveData): Record<string, any> => {
  let result = {};

  if (babel.types.isObjectExpression(node)) {
    for (const prop of node.properties) {
      if (babel.types.isObjectProperty(prop)) {
        if (babel.types.isIdentifier(prop.key)) {
          const objectKey = prop.key.name;
          if (babel.types.isIdentifier(prop.value)) {
            const valueToResolve = prop.value.name;
            // In this case we have some variable defined in the same or another file
            const resolved = resolve({ nodePath, currentFilePath, valueToResolve });
            result = {
              ...result,
              [objectKey]: { ...resolved },
            };
          } else {
            // In this case we have a primitive value
            const json = parseCodeJson(prop.value);
            result = {
              ...result,
              [objectKey]: json,
            };
          }
        }
      } else if (babel.types.isSpreadElement(prop)) {
        if (babel.types.isIdentifier(prop.argument)) {
          const valueToResolve = prop.argument.name;

          result = {
            ...result,
            ...resolve({ nodePath, currentFilePath, valueToResolve }),
          };
        }
      } else {
        // In this case we have a primitive value
        result = {
          ...result,
          ...parseCodeJson(prop),
        };
      }
    }
  }

  return result;
};

export const resolveMetadata = ({
  context,
  node,
  nodePath,
  options,
}: {
  context: Context;
  node: babel.types.Node;
  nodePath: NodePath<babel.types.Program>;
  options: ParseMitosisOptions;
}): Record<string, any> => {
  if (context.cwd && options?.filePath) {
    const currentFilePath = `${context.cwd}/${options.filePath}`;
    return resolveObjectsRecursive({ node, nodePath, currentFilePath });
  }

  return {};
};
