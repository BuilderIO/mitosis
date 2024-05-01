import type { MitosisComponent, ToReactOptions } from '@builder.io/mitosis';
import {
  Button,
  Divider,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Tab,
  Tabs,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useLocalObservable, useObserver } from 'mobx-react-lite';
import Image from 'next/image';
import { useRef } from 'react';

import { breakpoints } from '../../constants/breakpoints';
import { colors } from '../../constants/colors';
import { defaultCode, templates } from '../../constants/templates/jsx-templates';
import {
  defaultCode as defaultSvelteCode,
  templates as svelteTemplates,
} from '../../constants/templates/svelte-templates';
import { theme } from '../../constants/theme';
import { deleteQueryParam } from '../../functions/delete-query-param';
import { getQueryParam } from '../../functions/get-query-param';
import { localStorageGet } from '../../functions/local-storage-get';
import { localStorageSet } from '../../functions/local-storage-set';
import { setQueryParam } from '../../functions/set-query-param';
import { useEventListener } from '../../hooks/use-event-listener';
import { useReaction } from '../../hooks/use-reaction';
import { Show } from '../Show';
import { TextLink } from '../TextLink';

import MonacoEditor, { EditorProps, useMonaco } from '@monaco-editor/react/';
import { JsxCodeEditor } from '../JsxCodeEditor';
import { SvelteCodeEditor } from '../SvelteCodeEditor';

const generateCode = () => {
  console.log('generating code...');
  return import('./generate').then((mod) => mod.generateCode);
};
const mitosisCore = () => {
  console.log('importing mitosis...');
  return import('@builder.io/mitosis');
};

type Position = { row: number; column: number };

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

const AlphaPreviewMessage = () => (
  <ThemeProvider
    theme={createTheme({
      palette: {
        type: 'dark',
        primary: { main: colors.primary },
      },
    })}
  >
    <Alert
      severity="info"
      css={{
        background: 'none',
        fontSize: 15,
      }}
    >
      Mitosis is in beta, please{' '}
      <TextLink
        css={{ color: 'inherit', textDecoration: 'underline' }}
        href="https://github.com/BuilderIO/mitosis/issues"
        target="_blank"
      >
        report bugs and share feedback
      </TextLink>
    </Alert>
  </ThemeProvider>
);

const smallBreakpoint = breakpoints.mediaQueries.small;

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

type EditorRefArgs = Parameters<NonNullable<EditorProps['onMount']>>;
type Editor = EditorRefArgs[0];

// TODO: Build this Fiddle app with Mitosis :)
export default function Fiddle() {
  const monaco = useMonaco();

  const state = useLocalObservable(() => ({
    code: getQueryParam('code') || defaultCode,
    inputCode: defaultInputCode,
    output: '',
    outputTab: getQueryParam('outputTab') || 'vue',
    pendingBuilderChange: null as any,
    inputTab: getQueryParam('inputTab') || 'jsx',
    builderData: {} as any,
    isDraggingJSXCodeBar: false,
    jsxCodeTabWidth: Number(localStorageGet('jsxCodeTabWidth')) || 45,
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
      reactStyleType:
        localStorageGet('options.reactStyleType') ||
        ('styled-jsx' as 'emotion' | 'styled-jsx' as ToReactOptions['stylesType']),
      reactStateType:
        localStorageGet('options.reactStateType') || ('useState' as 'useState' | 'mobx' | 'solid'),
      svelteStateType:
        localStorageGet('options.svelteStateType') || ('variables' as 'variables' | 'proxies'),
      vueApi: localStorageGet('options.vueApi') || ('composition' as 'options' | 'composition'),
      alpineShorthandSyntax: localStorageGet('options.alpineShorthandSyntax') || 'false',
      alpineInline: localStorageGet('options.alpineInline') || 'false',
      angularStandalone: localStorageGet('options.angularStandalone') || 'false',
    },
    applyPendingBuilderChange(update?: any) {
      const builderJson = update || state.pendingBuilderChange;
      if (!builderJson) {
        return;
      }
      mitosisCore().then((mitosis) => {
        const jsxJson = mitosis.builderContentToMitosisComponent(builderJson);
        state.code = mitosis.componentToMitosis()({ component: jsxJson });
        state.pendingBuilderChange = null;
      });
    },

    async updateOutput() {
      try {
        state.pendingBuilderChange = null;

        let json: MitosisComponent;

        const { parseSvelte, parseJsx } = await mitosisCore();

        const commonOptions: { typescript: boolean } = {
          typescript: state.options.typescript === 'true',
        };

        switch (state.inputTab) {
          case 'svelte':
            json = await parseSvelte(state.code);
            break;
          case 'jsx':
          default:
            json = parseJsx(state.code, {
              typescript: commonOptions.typescript,
            });
            break;
        }
        const generateOptions = () => {
          switch (state.outputTab) {
            case 'alpine':
              return {
                useShorthandSyntax: this.options.alpineShorthandSyntax === 'true',
                inlineState: this.options.alpineInline === 'true',
              };
            case 'angular':
              return {
                standalone: this.options.angularStandalone === 'true',
              };
            case 'react':
              return {
                stylesType: state.options.reactStyleType,
                stateType: state.options.reactStateType,
              };
            case 'reactNative':
              return { stateType: state.options.reactStateType };
            case 'svelte':
              return { stateType: state.options.svelteStateType };
            case 'vue':
              return { api: state.options.vueApi };
            default:
              return {};
          }
        };

        const generator = await generateCode();

        state.output = (
          await generator({
            output: state.outputTab,
            options: { ...generateOptions(), ...commonOptions },
          })
        )({ component: json, path: '' });

        const { componentToBuilder } = await mitosisCore();
        const newBuilderData = await componentToBuilder()({ component: json });
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
    }
  });

  useEventListener<MouseEvent>(document.body, 'mouseup', (e) => {
    state.isDraggingJSXCodeBar = false;
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
    () => state.options.reactStyleType,
    (type) => localStorageSet('options.reactStyleType', type),
  );
  useReaction(
    () => state.options.reactStateType,
    (type) => localStorageSet('options.reactStateType', type),
  );
  useReaction(
    () => state.options.svelteStateType,
    (type) => localStorageSet('options.svelteStateType', type),
  );
  useReaction(
    () => state.options.vueApi,
    (type) => localStorageSet('options.vueApi', type),
  );
  useReaction(
    () => state.code,
    (code) => setQueryParam('code', code),
    { fireImmediately: false },
  );
  useReaction(
    () => state.outputTab,
    (tab) => {
      if (state.code) {
        setQueryParam('outputTab', tab);
      } else {
        deleteQueryParam('outputTab');
      }
      state.updateOutput();
    },
  );
  useReaction(
    () => state.inputTab,
    (tab) => {
      if (tab === 'svelte') {
        state.code = defaultSvelteCode;
        if (state.outputTab === 'svelte') {
          state.outputTab = 'vue';
        }
      } else {
        state.code = defaultCode;
      }

      setQueryParam('inputTab', tab);
    },
    { fireImmediately: false },
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
    const isDarkMode = theme.darkMode;
    const monacoTheme = isDarkMode ? 'vs-dark' : 'vs';
    const barStyle: any = {
      overflow: 'auto',
      whiteSpace: 'nowrap',
      ...(isDarkMode ? null : { backgroundColor: 'white' }),
    };
    return (
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          '& .monaco-editor .margin, & .monaco-editor, & .monaco-editor-background, .monaco-editor .inputarea.ime-input':
            {
              backgroundColor: 'transparent !important',
            },
        }}
      >
        <div
          css={{
            backgroundColor: '#1e1e1e',
          }}
        >
          <div
            css={{
              display: 'flex',
              position: 'relative',
              flexShrink: 0,
              alignItems: 'center',
              color: 'white',
              paddingTop: '5px',
              paddingBottom: '5px',
            }}
          >
            <a
              target="_blank"
              rel="noreferrer"
              href="https://github.com/builderio/mitosis"
              css={{
                marginRight: 'auto',
                paddingLeft: 20,
              }}
            >
              <Image alt="Mitosis Logo" src={'/mitosis-logo-white.png'} width={130} height={40} />
            </a>
            <div
              css={{
                marginLeft: 'auto',
                marginRight: 'auto',
                [smallBreakpoint]: { display: 'none' },
              }}
            >
              <AlphaPreviewMessage />
            </div>

            <div
              css={{
                display: 'flex',
                'a > span': {
                  color: 'white',
                  textDecoration: 'none',
                },
              }}
            >
              <Button
                size="small"
                variant="outlined"
                color="default"
                css={{
                  marginLeft: 'auto',
                  marginTop: 'auto',
                  marginBottom: 'auto',
                  marginRight: 10,
                  flexShrink: 0,
                }}
                onClick={() => {
                  theme.darkMode = !theme.darkMode;
                }}
              >
                🔆
              </Button>

              <a
                target="_blank"
                rel="noreferrer"
                css={{
                  marginRight: 25,
                  display: 'flex',
                  alignItems: 'center',
                }}
                href="https://github.com/builderio/mitosis"
              >
                <span
                  css={{
                    [smallBreakpoint]: { display: 'none' },
                    marginRight: '5px',
                  }}
                >
                  Source
                </span>
                <Image
                  width={30}
                  height={30}
                  src={'/github-logo.png'}
                  css={{ marginLeft: 10 }}
                  alt="Github Mark"
                />
              </a>
            </div>
          </div>
          <div
            css={{
              display: 'none',
              textAlign: 'center',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              [smallBreakpoint]: { display: 'block' },
            }}
          >
            <AlphaPreviewMessage />
          </div>
        </div>
        <div
          css={{
            display: 'flex',
            flexGrow: 1,
            overflow: 'hidden',
            [smallBreakpoint]: { flexDirection: 'column', overflow: 'unset' },
          }}
        >
          <div
            css={{
              width: `${state.jsxCodeTabWidth}%`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRight: `1px solid ${colors.contrast}`,
              [smallBreakpoint]: {
                width: '100%',
                height: 'calc(50vh - 30px)',
                overflow: 'hidden',
              },
            }}
          >
            <div
              css={{
                borderBottom: `1px solid ${colors.contrast}`,
                alignItems: 'center',
                display: 'flex',
                flexShrink: 0,
                height: 40,
                ...barStyle,
              }}
            >
              <Typography
                variant="body2"
                css={{
                  flexGrow: 1,
                  textAlign: 'left',
                  padding: '0 15px',
                  marginTop: 'auto',
                  marginBottom: 'auto',
                  color: theme.darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                }}
              >
                Inputs:
              </Typography>
              <Tabs
                css={{
                  minHeight: 0,
                  marginLeft: 'auto',
                  // borderBottom: `1px solid ${colors.contrast}`,
                  '& button': {
                    minHeight: 0,
                    minWidth: 100,
                  },
                }}
                value={state.inputTab}
                onChange={(e, value) => (state.inputTab = value)}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab
                  label={
                    <TabLabelWithIcon
                      label="Mitosis JSX"
                      icon="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F98d1ee2d3215406c9a6a83efc3f59494"
                    />
                  }
                  value="jsx"
                />
                <Tab
                  label={
                    <TabLabelWithIcon
                      label="Sveltosis"
                      icon="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F98d1ee2d3215406c9a6a83efc3f59494"
                    />
                  }
                  value="svelte"
                />
              </Tabs>
            </div>
            <Show when={state.inputTab === 'jsx'}>
              <div
                css={{
                  paddingTop: 15,
                  flexGrow: 1,
                  position: 'relative',
                  [smallBreakpoint]: {
                    paddingTop: 0,
                  },
                }}
              >
                <Select
                  disableUnderline
                  css={{
                    top: 10,
                    position: 'absolute',
                    right: 10,
                    zIndex: 10,
                    [smallBreakpoint]: {
                      display: 'block',
                      width: '160px',
                      marginLeft: 'auto',
                      position: 'relative',
                      top: 0,
                      right: 0,
                    },
                  }}
                  renderValue={(value) => (
                    <span css={{ textTransform: 'capitalize' }}>
                      {value === '_none' ? 'Choose template' : (value as string)}
                    </span>
                  )}
                  defaultValue="_none"
                  onChange={(e) => {
                    const template = templates[e.target.value as string];
                    if (template) {
                      state.code = template;
                    }
                  }}
                >
                  <MenuItem value="_none" disabled>
                    Choose template
                  </MenuItem>
                  {Object.keys(templates).map((key) => (
                    <MenuItem
                      key={key}
                      value={key}
                      css={{
                        textTransform: 'capitalize',
                      }}
                    >
                      {key}
                    </MenuItem>
                  ))}
                </Select>

                <JsxCodeEditor
                  options={{
                    renderLineHighlightOnlyWhenFocus: true,
                    overviewRulerBorder: false,
                    hideCursorInOverviewRuler: true,
                    automaticLayout: true,
                    minimap: { enabled: false },
                    scrollbar: { vertical: 'hidden' },
                  }}
                  onMount={(editor, monaco) => state.setEditorRef(editor, monaco)}
                  theme={monacoTheme}
                  height="calc(100vh - 105px)"
                  language="typescript"
                  value={state.code}
                  onChange={(val = '') => (state.code = val)}
                />
              </div>
            </Show>

            <Show when={state.inputTab === 'svelte'}>
              <div
                css={{
                  paddingTop: 15,
                  flexGrow: 1,
                  position: 'relative',
                  [smallBreakpoint]: {
                    paddingTop: 0,
                  },
                }}
              >
                <Select
                  disableUnderline
                  css={{
                    top: 10,
                    position: 'absolute',
                    right: 10,
                    zIndex: 10,
                    [smallBreakpoint]: {
                      display: 'block',
                      width: '160px',
                      marginLeft: 'auto',
                      position: 'relative',
                      top: 0,
                      right: 0,
                    },
                  }}
                  renderValue={(value) => (
                    <span css={{ textTransform: 'capitalize' }}>
                      {value === '_none' ? 'Choose template' : (value as string)}
                    </span>
                  )}
                  defaultValue="_none"
                  onChange={(e) => {
                    const template = svelteTemplates[e.target.value as string];
                    if (template) {
                      state.code = template;
                    }
                  }}
                >
                  <MenuItem value="_none" disabled>
                    Choose template
                  </MenuItem>
                  {Object.keys(svelteTemplates).map((key) => (
                    <MenuItem
                      key={key}
                      value={key}
                      css={{
                        textTransform: 'capitalize',
                      }}
                    >
                      {key}
                    </MenuItem>
                  ))}
                </Select>
                <SvelteCodeEditor
                  options={{
                    renderLineHighlightOnlyWhenFocus: true,
                    overviewRulerBorder: false,
                    hideCursorInOverviewRuler: true,
                    automaticLayout: true,
                    minimap: { enabled: false },
                    scrollbar: { vertical: 'hidden' },
                  }}
                  onMount={(editor, monaco) => state.setEditorRef(editor, monaco)}
                  theme={monacoTheme}
                  height="calc(100vh - 105px)"
                  language="html"
                  value={state.code}
                  onChange={(val = '') => (state.code = val)}
                />
              </div>
            </Show>
          </div>
          <div
            css={{
              cursor: 'col-resize',
              position: 'relative',
              zIndex: 100,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: -5,
                right: -5,
              },
            }}
            onMouseDown={(event) => {
              event.preventDefault();
              state.isDraggingJSXCodeBar = true;
            }}
          ></div>
          <div
            css={{
              width: `${100 - state.jsxCodeTabWidth}%`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              [smallBreakpoint]: {
                width: '100%',
                height: 'calc(100vh - 30px)',
                overflow: 'hidden',
              },
            }}
          >
            <div
              css={{
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                height: 40,
                borderBottom: `1px solid ${colors.contrast}`,
                [smallBreakpoint]: {
                  borderTop: `1px solid ${colors.contrast}`,
                },
                ...barStyle,
              }}
            >
              <Typography
                variant="body2"
                css={{
                  flexGrow: 1,
                  textAlign: 'left',
                  opacity: 0.7,
                  paddingLeft: 10,
                }}
              >
                Outputs:
              </Typography>
              <Tabs
                variant="scrollable"
                css={{
                  minHeight: 0,
                  marginLeft: 'auto',
                  // borderBottom: `1px solid ${colors.contrast}`,
                  '& button': {
                    minHeight: 0,
                    minWidth: 100,
                  },
                }}
                value={state.outputTab}
                onChange={(e, value) => (state.outputTab = value)}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab
                  label={
                    <TabLabelWithIcon
                      label="Vue"
                      icon="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fb7d34a76a77b40e2a981ef420d12d1c8"
                    />
                  }
                  value="vue"
                />
                <Tab
                  label={
                    <TabLabelWithIcon
                      label="React"
                      icon="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F1c7afa570a734d9f98e8ad45df0755e2"
                    />
                  }
                  value="react"
                />
                <Tab label={<TabLabelWithIcon label="Qwik" />} value="qwik" />
                <Tab label={<TabLabelWithIcon label="Angular" />} value="angular" />
                {state.inputTab !== 'svelte' && (
                  <Tab label={<TabLabelWithIcon label="Svelte" />} value="svelte" />
                )}
                <Tab label={<TabLabelWithIcon label="React Native" />} value="reactNative" />
                <Tab label="RSC" value="rsc" />
                <Tab label={<TabLabelWithIcon label="Swift" />} value="swift" />
                <Tab
                  label={
                    <TabLabelWithIcon
                      label="Solid"
                      icon="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F3835d178881b44db8fc51d3569ae97c6"
                    />
                  }
                  value="solid"
                />
                <Tab label={<TabLabelWithIcon label="Stencil" />} value="stencil" />
                <Tab label={<TabLabelWithIcon label="Marko" />} value="marko" />
                <Tab label={<TabLabelWithIcon label="Preact" />} value="preact" />
                <Tab label={<TabLabelWithIcon label="Lit" />} value="lit" />
                <Tab label={<TabLabelWithIcon label="Alpine.js" />} value="alpine" />
                <Tab label={<TabLabelWithIcon label="Webcomponents" />} value="webcomponents" />
                <Tab label={<TabLabelWithIcon label="HTML" />} value="html" />
                <Tab
                  label={
                    <TabLabelWithIcon
                      label="Liquid"
                      icon="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Ff98433f5a2b747f094bf01e2e88bde08"
                    />
                  }
                  value="liquid"
                />
                <Tab label={<TabLabelWithIcon label="Template" />} value="template" />
                <Tab label={<TabLabelWithIcon label="Mitosis" />} value="mitosis" />
                <Tab
                  label={
                    <TabLabelWithIcon
                      label="JSON"
                      icon="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fa64744451c9546a085a3ca662f7d5572"
                    />
                  }
                  value="json"
                />
                <Tab
                  label={
                    <TabLabelWithIcon
                      label="Builder"
                      // icon="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fa64744451c9546a085a3ca662f7d5572"
                    />
                  }
                  value="builder"
                />
              </Tabs>
            </div>
            <Show when={state.outputTab === 'swift'}>
              <Alert
                css={{
                  border: '1px solid rgb(128 182 224)',
                  margin: '10px 10px 0 10px',
                }}
                severity="info"
              >
                SwiftUI support is <b>experimental</b>
              </Alert>
            </Show>
            <div
              css={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.03)',
              }}
            >
              <Typography variant="body2" css={{ marginRight: 'auto', marginLeft: 10 }}>
                Typescript:
              </Typography>
              <RadioGroup
                css={{
                  flexDirection: 'row',
                  marginRight: 10,
                  '& .MuiFormControlLabel-label': {
                    fontSize: 12,
                  },
                }}
                aria-label="Typescript"
                name="typescript"
                value={state.options.typescript}
                onChange={(e) => {
                  state.options.typescript = e.target.value;
                  state.updateOutput();
                }}
              >
                <FormControlLabel
                  value="true"
                  control={<Radio color="primary" />}
                  labelPlacement="start"
                  label="Typescript"
                />
                <FormControlLabel
                  value="false"
                  labelPlacement="start"
                  control={<Radio color="primary" />}
                  label="Javascript"
                />
              </RadioGroup>
            </div>
            <Divider css={{ opacity: 0.6 }} />
            <Show when={state.outputTab === 'vue'}>
              <div
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                }}
              >
                <Typography variant="body2" css={{ marginRight: 'auto', marginLeft: 10 }}>
                  API:
                </Typography>
                <RadioGroup
                  css={{
                    flexDirection: 'row',
                    marginRight: 10,
                    '& .MuiFormControlLabel-label': {
                      fontSize: 12,
                    },
                  }}
                  aria-label="Vue API"
                  name="vueApi"
                  value={state.options.vueApi}
                  onChange={(e) => {
                    state.options.vueApi = e.target.value;
                    state.updateOutput();
                  }}
                >
                  <FormControlLabel
                    value="options"
                    control={<Radio color="primary" />}
                    labelPlacement="start"
                    label="Options API"
                  />
                  <FormControlLabel
                    value="composition"
                    labelPlacement="start"
                    control={<Radio color="primary" />}
                    label="Composition API"
                  />
                </RadioGroup>
              </div>
              <Divider css={{ opacity: 0.6 }} />
            </Show>
            <Show when={state.outputTab === 'react'}>
              <div
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                }}
              >
                <Typography variant="body2" css={{ marginRight: 'auto', marginLeft: 10 }}>
                  Style library:
                </Typography>
                <RadioGroup
                  css={{
                    flexDirection: 'row',
                    marginRight: 10,
                    '& .MuiFormControlLabel-label': {
                      fontSize: 12,
                    },
                  }}
                  aria-label="Style type"
                  name="reactStyleType"
                  value={state.options.reactStyleType}
                  onChange={(e) => {
                    state.options.reactStyleType = e.target.value;
                    state.updateOutput();
                  }}
                >
                  <FormControlLabel
                    value="style-tag"
                    control={<Radio color="primary" />}
                    labelPlacement="start"
                    label="Inline style tag"
                  />
                  <FormControlLabel
                    value="emotion"
                    control={<Radio color="primary" />}
                    labelPlacement="start"
                    label="Emotion CSS prop"
                  />
                  <FormControlLabel
                    value="styled-components"
                    labelPlacement="start"
                    control={<Radio color="primary" />}
                    label="Styled Components"
                  />
                  <FormControlLabel
                    value="styled-jsx"
                    labelPlacement="start"
                    control={<Radio color="primary" />}
                    label="Styled JSX"
                  />
                </RadioGroup>
              </div>
              <Divider css={{ opacity: 0.6 }} />
            </Show>
            <Show when={state.outputTab === 'react' || state.outputTab === 'reactNative'}>
              <div
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                }}
              >
                <Typography variant="body2" css={{ marginRight: 'auto', marginLeft: 10 }}>
                  State library:
                </Typography>
                <RadioGroup
                  css={{
                    flexDirection: 'row',
                    marginRight: 10,
                    '& .MuiFormControlLabel-label': {
                      fontSize: 12,
                    },
                  }}
                  aria-label="State type"
                  name="reactStateType"
                  value={state.options.reactStateType}
                  onChange={(e) => {
                    state.options.reactStateType = e.target.value;
                    state.updateOutput();
                  }}
                >
                  <Tooltip title="Does not support nested state mutation">
                    <FormControlLabel
                      value="useState"
                      control={<Radio color="primary" />}
                      labelPlacement="start"
                      label="useState"
                    />
                  </Tooltip>
                  <Tooltip title="Supports nested state mutation">
                    <FormControlLabel
                      value="mobx"
                      labelPlacement="start"
                      control={<Radio color="primary" />}
                      label="Mobx"
                    />
                  </Tooltip>
                  <Tooltip title="Supports nested state mutation">
                    <FormControlLabel
                      value="solid"
                      labelPlacement="start"
                      control={<Radio color="primary" />}
                      label="Solid"
                    />
                  </Tooltip>
                </RadioGroup>
              </div>
              <Divider />
            </Show>
            <Show when={state.outputTab === 'svelte'}>
              <div
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                }}
              >
                <Typography variant="body2" css={{ marginRight: 'auto', marginLeft: 10 }}>
                  State handling:
                </Typography>
                <RadioGroup
                  css={{
                    flexDirection: 'row',
                    marginRight: 10,
                    '& .MuiFormControlLabel-label': {
                      fontSize: 12,
                    },
                  }}
                  aria-label="State type"
                  name="svelteStateType"
                  value={state.options.svelteStateType}
                  onChange={(e) => {
                    state.options.svelteStateType = e.target.value;
                    state.updateOutput();
                  }}
                >
                  <Tooltip title="Does not support nested state mutation">
                    <FormControlLabel
                      value="variables"
                      control={<Radio color="primary" />}
                      labelPlacement="start"
                      label="Variables"
                    />
                  </Tooltip>
                  <Tooltip title="Supports nested state mutation">
                    <FormControlLabel
                      value="proxies"
                      labelPlacement="start"
                      control={<Radio color="primary" />}
                      label="Proxies"
                    />
                  </Tooltip>
                </RadioGroup>
              </div>
              <Divider />
            </Show>
            <Show when={state.outputTab === 'alpine'}>
              <div
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                }}
              >
                <Typography variant="body2" css={{ marginRight: 'auto', marginLeft: 10 }}>
                  Bindings:
                </Typography>
                <RadioGroup
                  css={{
                    flexDirection: 'row',
                    marginRight: 10,
                    '& .MuiFormControlLabel-label': {
                      fontSize: 12,
                    },
                  }}
                  aria-label="Alpine Binding Type"
                  name="alpineShorthandSyntax"
                  value={state.options.alpineShorthandSyntax}
                  onChange={(e) => {
                    state.options.alpineShorthandSyntax = e.target.value;
                    state.updateOutput();
                  }}
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio color="primary" />}
                    labelPlacement="start"
                    label="Short"
                  />
                  <FormControlLabel
                    value="false"
                    labelPlacement="start"
                    control={<Radio color="primary" />}
                    label="Full"
                  />
                </RadioGroup>
              </div>
              <Divider css={{ opacity: 0.6 }} />
              <div
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                }}
              >
                <Typography variant="body2" css={{ marginRight: 'auto', marginLeft: 10 }}>
                  Inline:
                </Typography>
                <RadioGroup
                  css={{
                    flexDirection: 'row',
                    marginRight: 10,
                    '& .MuiFormControlLabel-label': {
                      fontSize: 12,
                    },
                  }}
                  aria-label="Alpine Component Type"
                  name="alpineInline"
                  value={state.options.alpineInline}
                  onChange={(e) => {
                    state.options.alpineInline = e.target.value;
                    state.updateOutput();
                  }}
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio color="primary" />}
                    labelPlacement="start"
                    label="Inline"
                  />
                  <FormControlLabel
                    value="false"
                    labelPlacement="start"
                    control={<Radio color="primary" />}
                    label="Separate"
                  />
                </RadioGroup>
              </div>
            </Show>
            <Show when={state.outputTab === 'angular'}>
              <div
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                }}
              >
                <Typography variant="body2" css={{ marginRight: 'auto', marginLeft: 10 }}>
                  Standalone:
                </Typography>
                <RadioGroup
                  css={{
                    flexDirection: 'row',
                    marginRight: 10,
                    '& .MuiFormControlLabel-label': {
                      fontSize: 12,
                    },
                  }}
                  aria-label="Angular Standalone Selection"
                  name="angularStandalone"
                  value={state.options.angularStandalone}
                  onChange={(e) => {
                    state.options.angularStandalone = e.target.value;
                    state.updateOutput();
                  }}
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio color="primary" />}
                    labelPlacement="start"
                    label="Standalone"
                  />
                  <FormControlLabel
                    value="false"
                    labelPlacement="start"
                    control={<Radio color="primary" />}
                    label="Modules"
                  />
                </RadioGroup>
              </div>
            </Show>
            <div css={{ flexGrow: 1 }}>
              <div css={{ paddingTop: 15, height: '100%' }}>
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
                  }}
                  theme={monacoTheme}
                  language={
                    state.outputTab === 'swift'
                      ? 'swift'
                      : state.outputTab === 'json' || state.outputTab === 'builder'
                      ? 'json'
                      : state.outputTab === 'react' ||
                        state.outputTab === 'preact' ||
                        state.outputTab === 'rsc' ||
                        state.outputTab === 'qwik' ||
                        state.outputTab === 'lit' ||
                        state.outputTab === 'reactNative' ||
                        state.outputTab === 'mitosis' ||
                        state.outputTab === 'template' ||
                        state.outputTab === 'angular' ||
                        state.outputTab === 'webcomponents' ||
                        state.outputTab === 'qwik' ||
                        state.outputTab === 'stencil' ||
                        state.outputTab === 'solid'
                      ? 'typescript'
                      : 'html'
                  }
                  value={state.output}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  });
}
