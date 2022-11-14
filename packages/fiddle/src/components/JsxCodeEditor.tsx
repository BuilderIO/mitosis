import { Linter as ESLinter } from 'eslint';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { rules, configs as lintConfigs } from '@builder.io/eslint-plugin-mitosis';

const JsxRuntimeTypes = require('!!raw-loader!@builder.io/mitosis/jsx-runtime').default;
const MitosisTypes = require('!!raw-loader!@builder.io/mitosis/types').default;

import MonacoEditor, { EditorProps as MonacoEditorProps, useMonaco } from '@monaco-editor/react';

const Linter: typeof ESLinter = require('eslint/lib/linter/linter').Linter;
const linter = new Linter();
const recommendedRules: Record<string, any> = {};

linter.defineRules(rules as any);
Object.entries(lintConfigs.recommended.rules).forEach(([key, value]) => {
  const trimmedKey = key.replace(/^@builder.io\/mitosis\//, '');
  recommendedRules[trimmedKey] = value;
});

function eslint(code: string, version: any) {
  try {
    const markers = linter
      .verify(
        code,
        {
          rules: {
            ...recommendedRules,
            'no-var-declaration-or-assignment-in-component': 'off',
          },
          parserOptions: {
            sourceType: 'module',
            ecmaVersion: 2020,
            ecmaFeatures: {
              jsx: true,
            },
          },
        },
        {
          filename: 'mitosis.lite.tsx',
        },
      )
      .map((err) => ({
        startLineNumber: err.line,
        endLineNumber: err.line,
        startColumn: err.column,
        endColumn: err.column,
        message: `${err.message} (${err.ruleId})`,
        severity: 3,
        source: 'ESLint',
      }));
    return { markers, version };
  } catch (err) {
    // These can generally be ignored - invalid syntax and whatnot
    console.warn('Eslint error', err);
    return null;
  }
}

type EditorRefArgs = Parameters<NonNullable<MonacoEditorProps['onMount']>>;
type Editor = EditorRefArgs[0];

export function JsxCodeEditor(props: MonacoEditorProps) {
  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) {
      return;
    }

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types'],
    });

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    // add types
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      MitosisTypes,
      'file:///node_modules/@builder.io/mitosis/index.d.ts',
    );
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      JsxRuntimeTypes,
      'file:///node_modules/react/jsx-runtime.d.ts',
    );

    monaco.languages.registerDocumentFormattingEditProvider('typescript', {
      async provideDocumentFormattingEdits(model) {
        const prettier = await import('prettier/standalone');
        const typescript = await import('prettier/parser-typescript');
        const text = prettier.format(model.getValue(), {
          parser: 'typescript',
          plugins: [typescript],
          singleQuote: true,
        });

        return [
          {
            range: model.getFullModelRange(),
            text,
          },
        ];
      },
    });
  }, [monaco]);

  const [editor, setEditor] = useState<Editor | null>(null);
  useDebounce(
    () => {
      if (typeof props.value !== 'string') {
        return;
      }
      if (!editor || !monaco) {
        return;
      }
      const model = editor.getModel();
      if (!model) {
        return;
      }
      const result = eslint(props.value, editor!.getModel()?.getVersionId());
      if (!result) {
        return;
      }
      monaco.editor.setModelMarkers(model, 'eslint', result.markers);
    },
    2000,
    [props.value, editor],
  );

  return (
    <MonacoEditor
      options={{
        renderLineHighlightOnlyWhenFocus: true,
        overviewRulerBorder: false,
        hideCursorInOverviewRuler: true,
        automaticLayout: true,
        minimap: { enabled: false },
        scrollbar: { vertical: 'hidden' },
        ...props.options,
      }}
      language="typescript"
      path="mitosis.tsx"
      {...props}
      onMount={(editor, monaco) => {
        setEditor(editor);
        props.onMount?.(editor, monaco);
      }}
    />
  );
}
