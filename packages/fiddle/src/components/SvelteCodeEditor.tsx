import MonacoEditor, { EditorProps as MonacoEditorProps, useMonaco } from '@monaco-editor/react';
import * as prettierPluginSvelte from 'prettier-plugin-svelte';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';

type EditorRefArgs = Parameters<NonNullable<MonacoEditorProps['onMount']>>;
type Editor = EditorRefArgs[0];

export function SvelteCodeEditor(props: MonacoEditorProps) {
  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) {
      return;
    }

    monaco.languages.registerDocumentFormattingEditProvider('html', {
      async provideDocumentFormattingEdits(model) {
        const prettier = await import('prettier/standalone');
        const text = prettier.format(model.getValue(), {
          parser: 'html',
          plugins: [prettierPluginSvelte],
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
      setTimeout(() => {
        editor?.getAction('editor.action.formatDocument').run();
      }, 1000);
    },
    2000,
    [props.value],
  );

  return (
    <MonacoEditor
      onMount={(editor, monaco) => {
        setEditor(editor);
        props.onMount?.(editor, monaco);
      }}
      options={{
        renderLineHighlightOnlyWhenFocus: true,
        overviewRulerBorder: false,
        hideCursorInOverviewRuler: true,
        automaticLayout: true,
        formatOnPaste: true,
        formatOnType: true,
        minimap: { enabled: false },
        scrollbar: { vertical: 'hidden' },
        ...props.options,
      }}
      {...props}
      language="html"
      path="component.svelte"
    />
  );
}
