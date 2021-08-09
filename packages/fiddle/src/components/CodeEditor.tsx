import MonacoEditor, { MonacoEditorProps } from 'react-monaco-editor';
import { Linter as ESLinter } from 'eslint';
import * as monaco from 'monaco-editor';
// eslint-disable-next-line import/no-webpack-loader-syntax
import types from 'raw-loader!@builder.io/mitosis/dist/src/jsx-types';
import React, { useState } from 'react';
import { useDebounce } from 'react-use';
import { rules } from 'eslint-plugin-mitosis';

const Linter: typeof ESLinter = require('eslint/lib/linter/linter').Linter;

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.Latest,
  allowNonTsExtensions: true,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  module: monaco.languages.typescript.ModuleKind.CommonJS,
  noEmit: true,
  esModuleInterop: true,
  jsx: monaco.languages.typescript.JsxEmit.React,
  reactNamespace: 'React',
  allowJs: true,
  typeRoots: ['node_modules/@types'],
});

monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: false,
  noSyntaxValidation: false,
});

monaco.languages.typescript.typescriptDefaults.addExtraLib(
  types,
  `file:///node_modules/@react/types/index.d.ts`,
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

const linter = new Linter();
linter.defineRules(rules as any);

function eslint(code: string, version: any) {
  try {
    const markers = linter
      .verify(
        code,
        {
          rules: {
            'static-control-flow': 'error',
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
          filename: 'mitosis-file.tsx',
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

export function CodeEditor(props: MonacoEditorProps) {
  const [editor, setEditor] = useState(
    null as null | monaco.editor.IStandaloneCodeEditor,
  );
  useDebounce(
    () => {
      if (typeof props.value !== 'string') {
        return;
      }
      if (!editor) {
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
    [props.value],
  );

  return (
    <MonacoEditor
      editorDidMount={(editor, monaco) => {
        setEditor(editor);
        props.editorDidMount?.(editor, monaco);
      }}
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
      {...props}
    />
  );
}
