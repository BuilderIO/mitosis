import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { eslint } from './Fiddle/Linter';
const JsxRuntimeTypes = require('!!raw-loader!@builder.io/mitosis/jsx-runtime').default;
const MitosisTypes = require('!!raw-loader!@builder.io/mitosis/types').default;

import MonacoEditor, { EditorProps as MonacoEditorProps, useMonaco } from '@monaco-editor/react';

type EditorRefArgs = Parameters<NonNullable<MonacoEditorProps['onMount']>>;
type Editor = EditorRefArgs[0];

type Props = MonacoEditorProps & {
  disableLinting?: boolean;
};

export function JsxCodeEditor(props: Props) {
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
      noSemanticValidation: props.disableLinting || false,
      noSyntaxValidation: props.disableLinting || false,
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

      if (!props.disableLinting) {
        monaco.editor.setModelMarkers(model, 'eslint', result.markers);
      }
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
      language={props.disableLinting ? 'javascript' : 'typescript'}
      path="mitosis.tsx"
      {...props}
      onMount={(editor, monaco) => {
        setEditor(editor);
        props.onMount?.(editor, monaco);
      }}
    />
  );
}
