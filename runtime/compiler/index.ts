import ts from 'npm:typescript';

// This function transpiles the source code to JavaScript and returns the result along with array of dependencies
export function compileAndParseDependencies(src: string) {
  let dependencies: string[] = [];

  const result = ts.transpileModule(src, {
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
    },
    transformers: {
      before: [
        (context) => {
          return (sourceFile) => {
            ts.forEachChild(sourceFile, (node) => {
              if (ts.isImportDeclaration(node)) {
                dependencies.push(node.moduleSpecifier.getText(sourceFile));
              }

              if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
                dependencies.push(node.moduleSpecifier.getText(sourceFile));
              }

              if (ts.isExportAssignment(node) && node.expression) {
                dependencies.push(node.expression.getText(sourceFile));
              }

              if (ts.isCallExpression(node) && node.expression) {
                if (node.expression.getText(sourceFile) === 'import') {
                  dependencies.push(node.arguments[0].getText(sourceFile));
                }
              }

              if (ts.isExportSpecifier(node)) {
                dependencies.push(node.name.getText(sourceFile));
              }
            });
            return sourceFile;
          };
        },
      ],
    },
  });

  try {
    dependencies = dependencies.map((dep) => {
      if (dep.startsWith('"') || dep.startsWith("'")) {
        dep = dep.slice(1, -1);
      }

      if (dep.endsWith('"') || dep.endsWith("'")) {
        dep = dep.slice(0, -1);
      }

      return dep;
    });
  } catch {
    // do nothing
  }

  return {
    transpiled: result.outputText,
    dependencies: [...new Set(dependencies)],
  };
}
