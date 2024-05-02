import {
  component$,
  noSerialize,
  useSignal,
  useVisibleTask$,
  type HTMLAttributes,
  type NoSerialize,
  type PropFunction,
} from '@builder.io/qwik';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

export type CodeEditorProps = {
  class?: HTMLAttributes<HTMLElement>['class'];
  style?: Record<string, string | number | undefined>;
  onChange$?: PropFunction<(value: string) => void>;
  onSave$?: PropFunction<(value: string) => void>;
  language?: string;
} & ({ value: string; defaultValue?: string } | { defaultValue: string; value?: string });

export const CodeEditor = component$((props: CodeEditorProps) => {
  const hostRef = useSignal<HTMLElement>();
  const editorRef =
    useSignal<
      NoSerialize<monaco.editor.IStandaloneCodeEditor | monaco.editor.IStandaloneDiffEditor>
    >();

  console.log('render?');

  useVisibleTask$(({ cleanup }) => {
    editorRef.value?.dispose();
    (editorRef.value?.getModel() as any)?.dispose?.();

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: 'React.createElement',
      allowNonTsExtensions: true,
      allowJs: true,
      target: monaco.languages.typescript.ScriptTarget.Latest,
    });

    const value = props.defaultValue || props.value;

    editorRef.value = noSerialize(
      monaco.editor.create(hostRef.value!, {
        value: value,
        language: props.language || 'typescript',
        automaticLayout: true,
        theme: 'vs-dark',
        fontSize: 15,
        minimap: {
          enabled: false,
        },
        model: monaco.editor.createModel(value!, props.language),
      }),
    );

    console.log('new mount');

    const listener =
      (editorRef.value as monaco.editor.IStandaloneCodeEditor)!.onDidChangeModelContent?.(() => {
        props.onChange$?.((editorRef.value as monaco.editor.IStandaloneCodeEditor)!.getValue());
      });

    editorRef.value!.addAction({
      id: 'save',
      label: 'save',

      // An optional array of keybindings for the action.
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],

      // Method that will be executed when the action is triggered.
      // @param editor The editor instance is passed in as a convinience
      run: (ed) => {
        props.onSave$?.(ed.getValue());
      },
    });

    cleanup(() => listener?.dispose());
  });

  useVisibleTask$(() => {
    self.MonacoEnvironment = {
      getWorker(_, label) {
        if (label === 'json') {
          return new jsonWorker();
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
          return new cssWorker();
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
          return new htmlWorker();
        }
        if (label === 'typescript' || label === 'javascript') {
          return new tsWorker();
        }
        return new editorWorker();
      },
    };
  });

  useVisibleTask$(({ track }) => {
    track(() => editorRef.value);
    track(() => props.value);

    if (editorRef.value && typeof props.value === 'string') {
      (editorRef.value as monaco.editor.IStandaloneCodeEditor).setValue(props.value);
    }
  });

  useVisibleTask$(({ track }) => {
    track(() => editorRef.value);
    track(() => props.language);

    if (editorRef.value && props.language) {
      monaco.editor.setModelLanguage(
        (editorRef.value as monaco.editor.IStandaloneCodeEditor).getModel()!,
        props.language,
      );
    }
  });

  return <div class={['overflow-hidden', props.class as any]} style={props.style} ref={hostRef} />;
});
