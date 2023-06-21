import { Node, Project, Symbol } from 'ts-morph';

const getSignalSymbol = (project: Project) => {
  const symbolExport = project.createSourceFile(
    'homepage3.lite.tsx',
    `import { Signal } from '@builder.io/mitosis';`,
  );

  // Find the original Signal symbol
  let signalSymbol: Symbol | undefined = undefined;
  symbolExport.forEachDescendant((node) => {
    if (Node.isImportSpecifier(node)) {
      signalSymbol = node.getSymbol()?.getAliasedSymbol();
    }
  });

  if (signalSymbol === undefined) {
    throw new Error('Could not find Signal symbol');
  }

  return signalSymbol as Symbol;
};

const getProject = (tsConfigFilePath: string) => {
  try {
    return new Project({ tsConfigFilePath });
  } catch (err) {
    throw new Error(
      'Error creating Typescript Project. Make sure `tsConfigFilePath` points to a valid tsconfig.json file',
    );
  }
};

export const findSignalAccess = ({
  code,
  tsConfigFilePath,
}: {
  code: string;
  tsConfigFilePath: string;
}) => {
  const project = getProject(tsConfigFilePath);

  const ast = project.createSourceFile('homepage2.lite.tsx', code);

  const signalSymbol = getSignalSymbol(project);

  ast.forEachDescendant((node) => {
    if (Node.isPropertyAccessExpression(node)) {
      const aliasSymbol = node.getExpression().getType().getTargetType()?.getAliasSymbol();
      const isSignal = aliasSymbol === signalSymbol;

      if (!isSignal) return;

      let isInsideType = false;
      let isInsideDeclaration = false;
      node.getParentWhile((parent, child) => {
        // stop once we hit the function block
        if (Node.isBlock(child) || Node.isBlock(parent)) {
          return false;
        }

        // crawl up parents to make sure we're not inside a type
        if (Node.isTypeNode(parent) || Node.isTypeAliasDeclaration(parent)) {
          isInsideType = true;
          return false;
        }

        // crawl up parents to make sure we're not inside a declaration
        if (Node.isVariableDeclaration(parent)) {
          isInsideDeclaration = true;
          return false;
        }

        return true;
      });

      if (isInsideType) return;
      if (isInsideDeclaration) return;

      console.log('Found Signals value access:', {
        node: node.getText(),
        line: node.getStartLineNumber(),
      });
    }
  });
};

// const traverseAst = (node: ts.Node, visitor: (node: ts.Node) => void) => {
//   visitor(node);
//   ts.forEachChild(node, (x) => traverseAst(x, visitor));
// };
// export const identifyType2 = (code: string) => {
//   const ast = ts.createSourceFile('code.ts', code, ts.ScriptTarget.Latest, true);

//   const visitor = (node: ts.Node) => {
//     if (
//       ts.isPropertyAccessExpression(node) &&
//       ts.isIdentifier(node.name) &&
//       node.name.text === 'k'
//     ) {
//       console.log();
//     }
//   };

//   traverseAst(ast, visitor);
// };
