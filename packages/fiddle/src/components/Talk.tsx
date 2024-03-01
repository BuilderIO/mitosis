import {
  builderContentToMitosisComponent,
  compileAwayBuilderComponents,
  componentToBuilder,
  componentToMitosis,
  componentToQwik,
  componentToReact,
  componentToSolid,
  componentToSvelte,
  componentToVue,
  mapStyles,
  MitosisComponent,
  parseJsx,
} from '@builder.io/mitosis';
import { Typography } from '@material-ui/core';
import { useLocalObservable, useObserver } from 'mobx-react-lite';
import { useRef, useState } from 'react';

import { defaultCode } from '../constants/templates/jsx-templates';
import { theme } from '../constants/theme';
import { getQueryParam } from '../functions/get-query-param';
import { localStorageGet } from '../functions/local-storage-get';
import { localStorageSet } from '../functions/local-storage-set';
import { setQueryParam } from '../functions/set-query-param';
import { useEventListener } from '../hooks/use-event-listener';
import { useReaction } from '../hooks/use-reaction';

import MonacoEditor, { EditorProps, useMonaco } from '@monaco-editor/react/';
import { JsxCodeEditor } from './JsxCodeEditor';

type Position = { row: number; column: number };

const generateValidJson = (codeJSON: any) => {
  return {
    '@type': '@builder.io/mitosis/component',
    subComponents: [],
    imports: [],
    exports: {},
    inputs: [],
    meta: {},
    refs: {},
    state: {},
    hooks: {},
    name: 'RenderContent',
    ...codeJSON,
    children:
      codeJSON.children?.map((x: any) => ({
        '@type': '@builder.io/mitosis/node',
        properties: {},
        ...x,
        children:
          x?.children?.map((innerX: any) => ({
            properties: {},
            '@type': '@builder.io/mitosis/node',
            children: [],
            ...innerX,
          })) || [],
      })) || [],
    context: {
      get: {},
      set: {
        ...codeJSON.context?.set,
      },
    },
  };
};

const DEFAULT_JSX_CODE = `
import RenderBlocks from './RenderBlocks.lite';
export default function RenderContent(props) {
  // onMount(() => {
  //   sendComponentsToVisualEditor(props.customComponents);
  // });

  // onUpdate(() => {
  //   dispatchNewContentToVisualEditor(props.content);
  // }, [props.content]);

  // setContext(BuilderContext, {
  //   content: props.content,
  //   registeredComponents: props.customComponents,
  // });

  // return (
  //   <div
  //     css={{ display: 'flex', flexDirection: 'columns' }}
  //     onClick={() => trackClick(props.content.id)}
  //   >
  //     <RenderBlocks blocks={props.content.blocks} />
  //   </div>
  // );
}
`;

const DEFAULT_JSON_CODE = {
  hooks: {
    onMount: {
      code: '\n  sendComponentsToVisualEditor(props.registeredComponents);\n',
    },
  },
};

const JSON_CODE_EXAMPLES = {
  ON_MOUNT: {
    hooks: {
      onMount: {
        code: '\n  sendComponentsToVisualEditor(props.customComponents);\n',
      },
    },
  },
  ON_UPDATE: {
    hooks: {
      onUpdate: [
        {
          code: '\n  dispatchNewContentToVisualEditor(props.content);\n',
          deps: '[props.content]',
        },
      ],
    },
  },
  SET_CONTEXT: {
    context: {
      set: {
        './BuilderContext.context.lite:default': {
          name: 'BuilderContext',
          value: {
            content: {
              code: 'props.content',
              type: 'property',
            },
            customComponents: {
              code: 'props.customComponents',
              type: 'property',
            },
          },
        },
      },
    },
    name: 'RenderContent',
  },
  STYLES: {
    children: [
      {
        name: 'div',
        bindings: {
          css: {
            code: "{\n  display: 'flex',\n  flexDirection: 'columns'\n}",
          },
        },
        children: [],
      },
    ],
    name: 'RenderContent',
  },
  CLICK: {
    children: [
      {
        name: 'div',
        bindings: {
          onClick: {
            code: 'trackClick(props.content.id)',
          },
        },
        children: [],
      },
    ],
  },
  RENDER_BLOCKS: {
    imports: [
      {
        imports: {
          RenderBlocks: 'default',
        },
        path: './RenderBlocks.lite',
      },
    ],
    children: [
      {
        name: 'RenderBlocks',
        bindings: {
          blocks: {
            code: 'props.content.blocks',
          },
        },
      },
    ],
    name: 'RenderContent',
  },
  COMPLETE: {
    name: 'RenderContent',
    imports: [
      {
        imports: {
          RenderBlocks: 'default',
        },
        path: './RenderBlocks.lite',
      },
    ],
    hooks: {
      onMount: {
        code: '\n  sendComponentsToVisualEditor(registeredComponent);\n',
      },
      onUpdate: [
        {
          code: '\n  dispatchNewContentToVisualEditor(props.content);\n',
          deps: '[props.content]',
        },
      ],
    },
    context: {
      set: {
        null: {
          name: 'BuilderContext',
          value: {
            content: {
              code: 'props.content',
              type: 'property',
            },
            registeredComponents: {
              code: 'props.customComponents',
              type: 'property',
            },
          },
        },
      },
    },
    children: [
      {
        name: 'div',
        bindings: {
          css: {
            code: "{\n  display: 'flex',\n  flexDirection: 'columns'\n}",
          },
          onClick: {
            code: 'trackClick(props.content.id)',
          },
        },
        children: [
          {
            name: 'RenderBlocks',
            bindings: {
              blocks: {
                code: 'props.content.blocks',
              },
            },
          },
        ],
      },
    ],
  },
};

const openTagRe = /(<[a-z]+[^>]*)/gi;

// Sync selections between the Builder editor and the fiddle
const SYNC_SELECTIONS = false;

const indexToRowAndColumn = (str: string, index: number): Position => {
  const rows = str.split('\n');
  let row = 0;
  let column = 0;
  let cursor = 0;
  while (cursor < index) {
    const rowText = rows[row];
    column++;
    if (column > rowText.length) {
      column = 0;
      row++;
      // cursor++;
    }

    if (cursor === index) {
      return { row, column };
    }
    cursor++;
  }
  return { row, column };
};

const rowColumnToIndex = (str: string, position: Position): number => {
  const rows = str.split('\n');
  let row = 0;
  let column = 0;
  let cursor = 0;
  while (true) {
    const rowText = rows[row];
    if (typeof rowText === undefined) {
      return cursor;
    }
    column++;
    if (column > rowText.length) {
      column = 0;
      row++;
      cursor++;
    }

    if (row === position.row && column === position.column) {
      return cursor;
    }
    cursor++;
  }
};

const debug = getQueryParam('debug') === 'true';

const TabLogo = (props: { src: string }) => {
  const size = 12;
  return (
    <img
      alt="Icon"
      src={`${props.src}?width=${size * 2}`}
      css={{
        marginRight: 7,
        objectFit: 'contain',
        objectPosition: 'center',
        height: size,
        width: size,
        filter: 'grayscale(100%)',
        opacity: 0.6,
        '.Mui-selected.MuiButtonBase-root &': {
          filter: 'none',
          opacity: 1,
        },
      }}
    />
  );
};

const TabLabelWithIcon = (props: { icon?: string; label: string }) => {
  const useIcon = false;
  return (
    <div css={{ display: 'flex', alignItems: 'center' }}>
      {useIcon && props.icon && <TabLogo src={props.icon} />} {props.label}
    </div>
  );
};

const defaultInputCode = `
import { Component, Input } from "@angular/core";

@Component({
  selector: "foo-component",
  template: \`
    <div>
      <input
        class="input"
        [value]="name"
        (input)="name = $event.target.value"
      />
      Hello {{name}} ! I can run in React, Vue, Solid, or Liquid!
    </div>
  \`,
})
export default class FooComponent {
  name = "Steve";
}
`;

const plugins = [
  compileAwayBuilderComponents(),
  mapStyles({
    map: (styles) => ({
      ...styles,
      boxSizing: undefined,
      flexShrink: undefined,
      alignItems: styles.alignItems === 'stretch' ? undefined : styles.alignItems,
    }),
  }),
];

type EditorRefArgs = Parameters<NonNullable<EditorProps['onMount']>>;
type Editor = EditorRefArgs[0];

const hasBothTsAndJsSupport = (outputTab: string) => {
  return ['svelte', 'vue'].includes(outputTab);
};

// TODO: Build this Fiddle app with Mitosis :)
export default function Fiddle() {
  const monaco = useMonaco();

  const [staticState] = useState(() => ({
    ignoreNextBuilderUpdate: false,
  }));
  const [builderData, setBuilderData] = useState<any>(null);
  const state = useLocalObservable(() => ({
    code: getQueryParam('code') || defaultCode,
    inputType: 'json' as 'json' | 'jsx',
    showInput: true,
    jsonExample: 'ON_MOUNT' as keyof typeof JSON_CODE_EXAMPLES,
    inputCode: defaultInputCode,
    output: { react: '', vue: '', svelte: '', qwik: '', solid: '' },
    outputTab: getQueryParam('outputTab') || 'vue',
    pendingBuilderChange: null as any,
    builderData: {} as any,
    isDraggingBuilderCodeBar: false,
    isDraggingJSXCodeBar: false,
    jsxCodeTabWidth: Number(localStorageGet('jsxCodeTabWidth')) || 45,
    builderPaneHeight: Number(localStorageGet('builderPaneHeight')) || 35,
    setEditorRef(editor: Editor, monaco: EditorRefArgs[1]) {
      monacoEditorRef.current = editor;
      if (editor) {
        if (SYNC_SELECTIONS) {
          editor.onDidChangeCursorPosition((event) => {
            const { position, reason } = event;

            if (reason !== monaco.editor.CursorChangeReason.Explicit) {
              return;
            }

            const index = rowColumnToIndex(state.code, {
              column: position.column - 1,
              row: position.lineNumber - 1,
            });

            const elementIndex =
              Array.from(state.code.substring(0, index).matchAll(openTagRe)).length - 1;

            if (elementIndex === -1) {
              return;
            }

            (
              document.querySelector('builder-editor iframe') as HTMLIFrameElement
            )?.contentWindow?.postMessage(
              {
                type: 'builder.changeSelection',
                data: {
                  index: elementIndex,
                },
              },
              '*',
            );
          });
        }
      }
    },
    options: {
      typescript: localStorageGet('options.typescript') || ('false' as 'true' | 'false'),
    },
    applyPendingBuilderChange(update?: any) {
      const builderJson = update || state.pendingBuilderChange;
      if (!builderJson) {
        return;
      }
      const jsxJson = builderContentToMitosisComponent(builderJson);
      state.code = componentToMitosis()({ component: jsxJson });
      state.pendingBuilderChange = null;
    },

    async updateOutput() {
      try {
        state.pendingBuilderChange = null;
        staticState.ignoreNextBuilderUpdate = true;

        let json: MitosisComponent;

        switch (state.inputType) {
          case 'json':
            json = JSON.parse(state.code);
            if (state.jsonExample !== 'COMPLETE') {
              json = generateValidJson(json) as any;
            } else {
              json = generateValidJson(json) as any;
            }
            break;
          case 'jsx':
            // const wrappedCode = `
            // import RenderBlocks from './RenderBlocks';

            // export default function RenderContent(props) {
            //   ${state.code}
            // }`;
            // console.log(wrappedCode);
            json = parseJsx(state.code);
            break;
        }

        let commonOptions: { typescript: boolean } = {
          typescript: hasBothTsAndJsSupport(state.outputTab) && state.options.typescript === 'true',
        };

        state.output = {
          react: componentToReact({
            stylesType: 'style-tag',
            stateType: 'useState',
            plugins,
            ...commonOptions,
          })({ component: json }),

          qwik: componentToQwik({ plugins, ...commonOptions })({ component: json }).trim(),

          vue: componentToVue({
            plugins,
            api: 'composition',
            ...commonOptions,
          })({ component: json, path: '' }),

          svelte: componentToSvelte({
            stateType: 'variables',
            plugins,
            ...commonOptions,
          })({ component: json }),

          solid: componentToSolid({ plugins, ...commonOptions })({ component: json }),
        };

        const newBuilderData = componentToBuilder()({ component: json });
        setBuilderData(newBuilderData);
      } catch (err) {
        if (debug) {
          throw err;
        } else {
          console.warn(err);
        }
      }
    },
  }));

  useEventListener<KeyboardEvent>(document.body, 'keydown', (e) => {
    // Cancel cmd+s, sometimes people hit it instinctively when editing code and the browser
    // "save webpage" dialog is unwanted and annoying
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      state.applyPendingBuilderChange();
    }
  });

  useEventListener<MouseEvent>(document.body, 'mousemove', (e) => {
    if (state.isDraggingJSXCodeBar) {
      const windowWidth = window.innerWidth;
      const pointerRelativeXpos = e.clientX;
      const newWidth = Math.max((pointerRelativeXpos / windowWidth) * 100, 5);
      state.jsxCodeTabWidth = Math.min(newWidth, 95);
    } else if (state.isDraggingBuilderCodeBar) {
      const bannerHeight = 0;
      const windowHeight = window.innerHeight;
      const pointerRelativeYPos = e.clientY;
      const newHeight = Math.max(
        (1 - (pointerRelativeYPos + bannerHeight) / windowHeight) * 100,
        5,
      );
      state.builderPaneHeight = Math.min(newHeight, 95);
    }
  });

  useEventListener<MouseEvent>(document.body, 'mouseup', (e) => {
    state.isDraggingJSXCodeBar = false;
    state.isDraggingBuilderCodeBar = false;
  });
  useEventListener<MessageEvent>(window, 'message', (e) => {
    if (e.data?.type === 'builder.saveCommand') {
      if (e.data.data || state.pendingBuilderChange) {
        state.applyPendingBuilderChange(e.data.data || state.pendingBuilderChange);
      }
    } else if (e.data?.type === 'builder.selectionChange') {
      if (SYNC_SELECTIONS) {
        // TODO: only do this when this editor does *not* have focus
        const { selectionIndices } = e.data.data;
        if (Array.isArray(selectionIndices)) {
          const index = selectionIndices[0];
          if (typeof index === 'number') {
            const code = state.code;
            let match: RegExpExecArray | null;

            let i = 0;
            while ((match = openTagRe.exec(code)) != null) {
              if (!match) {
                break;
              }
              if (i++ === index) {
                const index = match.index;
                const length = match[1].length;
                if (monaco) {
                  const start = indexToRowAndColumn(code, index - 1);
                  const end = indexToRowAndColumn(code, index + length + 1);
                  const startPosition = new monaco.Position(start.row + 1, start.column + 1);
                  const endPosition = new monaco.Position(end.row + 1, end.column + 1);

                  monacoEditorRef.current?.setSelection(
                    monaco.Selection.fromPositions(startPosition, endPosition),
                  );
                }
                break;
              }
            }
          }
        }
      }
    }
  });

  const monacoEditorRef = useRef<Editor | null>(null);

  useReaction(
    () => state.jsxCodeTabWidth,
    (width) => localStorageSet('jsxCodeTabWidth', width),
    { fireImmediately: false, delay: 1000 },
  );

  useReaction(
    () => state.builderPaneHeight,
    (width) => localStorageSet('builderPaneHeight', width),
    { fireImmediately: false, delay: 1000 },
  );

  useReaction(
    () => state.code,
    (code) => setQueryParam('code', code),
    { fireImmediately: false },
  );
  useReaction(
    () => state.inputType,
    (tab) => {
      if (tab === 'json') {
        state.code = JSON.stringify(DEFAULT_JSON_CODE, null, 2);
      } else {
        state.code = DEFAULT_JSX_CODE;
      }

      setQueryParam('inputTab', tab);
    },
    { fireImmediately: true },
  );

  useReaction(
    () => state.code,
    (code) => {
      state.updateOutput();
    },
    { delay: 1000 },
  );

  useReaction(
    () => state.inputCode,
    (code) => {
      state.updateOutput();
    },
    { delay: 1000 },
  );

  return useObserver(() => {
    const monacoTheme = theme.darkMode ? 'vs-dark' : 'vs';

    return (
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          padding: 8,
          height: '100vh',
        }}
      >
        <div
          css={{
            flexGrow: 1,
            position: 'absolute',
            top: 0,
            right: 16,
            color: theme.darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
            zIndex: 2,
          }}
        >
          <div>
            <button
              onClick={() => {
                theme.darkMode = !theme.darkMode;
              }}
            >
              🌚
            </button>
            <div>JSON examples:</div>
            <select
              name="pets"
              id="pet-select"
              value={state.jsonExample}
              onChange={(x) => {
                const key = x.target.value as keyof typeof JSON_CODE_EXAMPLES;
                state.jsonExample = key;
                state.inputType = 'json';
                state.code = JSON.stringify(JSON_CODE_EXAMPLES[key], null, 2);
              }}
            >
              {Object.keys(JSON_CODE_EXAMPLES).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          <div
            css={{
              paddingTop: 24,
            }}
          >
            <button
              onClick={() => {
                state.showInput = !state.showInput;
              }}
            >
              HIDE/SHOW INPUT
            </button>
          </div>

          <div
            css={{
              paddingTop: 24,
            }}
          >
            <div>Generator:</div>
            <button
              onClick={() => {
                state.inputType = state.inputType === 'json' ? 'jsx' : 'json';
              }}
            >
              USE {state.inputType.toUpperCase()}
            </button>
          </div>
        </div>
        {state.showInput && (
          <div
            css={{
              position: 'relative',
              height: 380,
              border: '1px solid black',
              margin: '0 300px',
              flexGrow: 1,
            }}
          >
            <Typography
              variant="h3"
              css={{
                flexGrow: 1,
                position: 'absolute',
                bottom: 0,
                right: 16,
                color: theme.darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                zIndex: 2,
              }}
            >
              Input
            </Typography>
            <JsxCodeEditor
              disableLinting={true}
              options={{
                renderLineHighlightOnlyWhenFocus: true,
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                automaticLayout: true,
                minimap: { enabled: false },
                scrollbar: { vertical: 'hidden' },
                fontSize: 18,
              }}
              onMount={(editor, monaco) => state.setEditorRef(editor, monaco)}
              theme={monacoTheme}
              language={state.inputType === 'json' ? 'json' : 'typescript'}
              value={state.code}
              onChange={(val = '') => (state.code = val)}
            />
          </div>
        )}

        <div
          key={state.showInput.toString()}
          css={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
        >
          {(
            [
              ['vue', 'svelte'],
              ['solid', 'qwik'],
            ] as const
          ).map((outputArr) => (
            <div
              key={outputArr.join(',')}
              css={{
                display: 'flex',
                flexGrow: 1,
              }}
            >
              {outputArr.map((output) => (
                <div
                  key={output}
                  css={{
                    height: '100%',
                    width: '50%',
                    position: 'relative',
                    border: '1px solid black',
                  }}
                >
                  <Typography
                    variant="h3"
                    css={{
                      flexGrow: 1,
                      position: 'absolute',
                      bottom: 0,
                      right: 16,
                      color: theme.darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                      zIndex: 2,
                    }}
                  >
                    {output[0].toUpperCase() + output.slice(1)}
                  </Typography>
                  <MonacoEditor
                    height="100%"
                    options={{
                      automaticLayout: true,
                      overviewRulerBorder: false,
                      foldingHighlight: false,
                      renderLineHighlightOnlyWhenFocus: true,
                      occurrencesHighlight: false,
                      readOnly: getQueryParam('readOnly') !== 'false',
                      minimap: { enabled: false },
                      renderLineHighlight: 'none',
                      selectionHighlight: false,
                      scrollbar: { vertical: 'hidden' },
                      fontSize: 18,
                    }}
                    theme={monacoTheme}
                    language={output === 'qwik' || output === 'solid' ? 'typescript' : 'html'}
                    value={state.output[output]}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  });
}
