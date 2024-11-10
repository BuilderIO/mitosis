import { mapImportDeclarationToMitosisImport } from '@/helpers/mitosis-imports';
import { babelDefaultTransform, babelStripTypes } from '@/parsers/jsx/helpers';
import { Context, ParseMitosisOptions } from '@/parsers/jsx/types';
import { MitosisImport } from '@/types/mitosis-component';
import * as babel from '@babel/core';
import { NodePath } from '@babel/core';
import generate from '@babel/generator';
import { existsSync, readFileSync } from 'fs-extra-promise';
import * as path from 'path';

type ResolveData = {
  nodePath: NodePath<babel.types.Program>;
  currentFilePath?: string;
  codeBlocks: string[];
};

const getCodeFromImport = (
  currentFile: string,
  importObject: MitosisImport,
): { code?: string; typescript: boolean; importFile?: string } => {
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
};

const fillDeclarations = ({
  declaration,
  valueToResolve,
  codeBlocks,
  currentFilePath,
  nodePath,
}: {
  declaration: babel.types.VariableDeclaration;
  valueToResolve?: string;
} & ResolveData) => {
  for (const variable of declaration.declarations) {
    if (babel.types.isIdentifier(variable.id)) {
      if (variable.id.name === valueToResolve && variable.init) {
        resolveObjectsRecursive({
          node: variable.init,
          nodePath,
          currentFilePath,
          codeBlocks,
        });
      }
    }
  }
};

const resolveObjectsRecursive = ({
  node,
  nodePath,
  currentFilePath,
  codeBlocks,
}: {
  node: babel.types.Node;
} & ResolveData): string => {
  const programNodes = nodePath.node.body;
  if (babel.types.isObjectExpression(node) && currentFilePath) {
    for (const prop of node.properties) {
      let valueToResolve: string | undefined;
      let objectKey: string | undefined;
      if (babel.types.isObjectProperty(prop)) {
        if (babel.types.isIdentifier(prop.key)) {
          if (babel.types.isIdentifier(prop.value)) {
            objectKey = prop.key.name;
            valueToResolve = prop.value.name;
          }
        }
      }
      if (babel.types.isSpreadElement(prop)) {
        if (babel.types.isIdentifier(prop.argument)) {
          valueToResolve = prop.argument.name;
        }
      }

      if (valueToResolve) {
        // If key and value are identifiers, this isn't a valid json, rather an external
        for (const statement of programNodes) {
          if (babel.types.isImportDeclaration(statement)) {
            const importObject = mapImportDeclarationToMitosisImport(statement);

            if (Object.keys(importObject.imports).includes(valueToResolve)) {
              const { code, typescript, importFile } = getCodeFromImport(
                currentFilePath,
                importObject,
              );
              if (code) {
                const jsxToUse = babelStripTypes(code, typescript);

                babelDefaultTransform(jsxToUse, {
                  Program(path) {
                    const statements: babel.types.Statement[] = path.node.body;
                    for (const pStatement of statements) {
                      if (babel.types.isExportNamedDeclaration(pStatement)) {
                        const declaration = pStatement.declaration;
                        if (babel.types.isVariableDeclaration(declaration)) {
                          fillDeclarations({
                            declaration,
                            valueToResolve,
                            codeBlocks,
                            currentFilePath: importFile,
                            nodePath: path,
                          });
                        }
                      }
                    }
                  },
                });
              }
            }
          } else if (babel.types.isVariableDeclaration(statement)) {
            fillDeclarations({
              declaration: statement,
              valueToResolve,
              codeBlocks,
              currentFilePath,
              nodePath,
            });
          }
        }
      } else {
        let code = generate(prop).code;
        if (objectKey) {
          code = `{${objectKey}:${code}}`;
        }
        codeBlocks.push(code);
      }
    }

    return `{${codeBlocks.join(',')}}`;
  }

  return generate(node).code;
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
}): string => {
  const codeBlocks: string[] = [];
  let currentFilePath: string | undefined;
  if (context.cwd && options?.filePath) {
    currentFilePath = `${context.cwd}/${options.filePath}`;
  }

  return resolveObjectsRecursive({ node, codeBlocks, nodePath, currentFilePath });
};
