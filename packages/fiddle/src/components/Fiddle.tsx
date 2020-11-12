import { useLocalStore, useObserver } from 'mobx-react-lite';
import React, { useState } from 'react';
import { getQueryParam } from '../functions/get-query-param';
import MonacoEditor from 'react-monaco-editor';
import { useReaction } from '../hooks/use-reaction';
import { setQueryParam } from '../functions/set-query-param';
import * as monaco from 'monaco-editor';
import logo from '../assets/jsx-lite-logo-white.png';
import githubLogo from '../assets/GitHub-Mark-Light-64px.png';
import {
  parseJsx,
  componentToVue,
  componentToReact,
  componentToLiquid,
  componentToBuilder,
  builderContentToJsxLiteComponent,
  componentToJsxLite,
} from '@jsx-lite/core';
import {
  Button,
  FormControlLabel,
  MenuItem,
  Select,
  Switch,
  Tab,
  Tabs,
  Typography,
} from '@material-ui/core';
import { deleteQueryParam } from '../functions/delete-query-param';
import { TextLink } from './TextLink';
import { defaultCode, templates } from '../constants/templates';
// eslint-disable-next-line import/no-webpack-loader-syntax
import types from 'raw-loader!@jsx-lite/core/dist/jsx';
import { colors } from '../constants/colors';
import { useEventListener } from '../hooks/use-event-lisetener';
import { adapt } from 'webcomponents-in-react';
import { theme } from '../constants/theme';

const builderOptions = {
  useDefaultStyles: false,
  previewUrl: 'https://jsx-lite-fiddle.web.app/preview.html',
};

const BuilderEditor = adapt('builder-editor');

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

const useSaveButton = true;

// TODO: Build this Fiddle app with JSX Lite :)
export default function Fiddle() {
  const [staticState] = useState(() => ({
    ignoreNextBuilderUpdate: false,
  }));
  const [builderData, setBuilderData] = useState<any>(null);
  const state = useLocalStore(() => ({
    code: getQueryParam('code') || defaultCode,
    output: '',
    tab: getQueryParam('tab') || 'vue',
    pendingBuilderChange: null as any,
    noCodeTab: 'builder',
    builderData: {} as any,
    applyPendingBuilderChange(update?: any) {
      const builderJson = update || state.pendingBuilderChange;
      if (!builderJson) {
        return;
      }
      const jsxJson = builderContentToJsxLiteComponent(builderJson);
      state.code = componentToJsxLite(jsxJson);
      console.log('Builder set code', state.code);
      state.pendingBuilderChange = null;
    },
    updateOutput() {
      try {
        state.pendingBuilderChange = null;
        staticState.ignoreNextBuilderUpdate = true;
        const json = parseJsx(state.code);
        state.output =
          state.tab === 'liquid'
            ? componentToLiquid(json)
            : state.tab === 'react'
            ? componentToReact(json)
            : state.tab === 'json' || state.tab === 'builder'
            ? JSON.stringify(json, null, 2)
            : componentToVue(json);

        const newBuilderData = componentToBuilder(json);
        console.log('Setting Builder data', { builderData: newBuilderData });
        setBuilderData(newBuilderData);
      } catch (err) {
        console.warn(err);
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

  useReaction(
    () => state.code,
    (code) => setQueryParam('code', code),
    { fireImmediately: false },
  );
  useReaction(
    () => state.tab,
    (tab) => {
      if (state.code) {
        setQueryParam('tab', tab);
      } else {
        deleteQueryParam('tab');
      }
      state.updateOutput();
    },
  );

  useReaction(
    () => state.code,
    (code) => {
      state.updateOutput();
    },
    { delay: 1000 },
  );

  const outputMonacoEditorSize = 'calc(50vh - 200px)';

  return useObserver(() => {
    const lightColorInvert = {}; // theme.darkMode ? null : { filter: 'invert(1) ' };
    const monacoTheme = theme.darkMode ? 'vs-dark' : 'vs-light';
    const barStyle = theme.darkMode ? null : { backgroundColor: 'white' };

    return (
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          '& .monaco-editor .margin, & .monaco-editor, & .monaco-editor-background, .monaco-editor .inputarea.ime-input': {
            backgroundColor: 'transparent !important',
          },
        }}
      >
        <div
          css={{
            display: 'flex',
            position: 'relative',
            flexShrink: 0,
            alignItems: 'center',
            borderBottom: `1px solid ${colors.contrast}`,
            backgroundColor: '#1e1e1e',
            color: 'white',
          }}
        >
          <a
            target="_blank"
            rel="noreferrer"
            href="https://github.com/builderio/jsx-lite"
            css={{
              marginRight: 'auto',
            }}
          >
            <img
              alt="JSX Lite Logo"
              src={logo}
              css={{
                marginLeft: 10,
                objectFit: 'contain',
                width: 200,
                height: 60,
                ...lightColorInvert,
              }}
            />
          </a>
          {/* TODO: maybe add back, TBD */}
          {/* <div css={{ marginRight: 'auto', color: '#bbb' }}>
            Made with <span css={{ opacity: 0.7 }}>❤️</span> by{' '}
            <TextLink href="https://www.builder.io" target="_blank">
              Builder.io
            </TextLink>
          </div> */}

          {/* <FormControlLabel
            css={{ marginRight: 20 }}
            value="start"
            control={
              <Switch
                color="primary"
                checked={theme.darkMode}
                onChange={(e, value) => (theme.darkMode = value)}
              />
            }
            label="Dark Mode"
            labelPlacement="start"
          /> */}

          <a
            target="_blank"
            rel="noreferrer"
            css={{
              marginRight: 25,
              display: 'flex',
              alignItems: 'center',
            }}
            href="https://github.com/builderio/jsx-lite"
          >
            Source
            <img
              width={30}
              src={githubLogo}
              css={{ marginLeft: 10, ...lightColorInvert }}
              alt="Github Mark"
            />
          </a>
        </div>
        <div css={{ display: 'flex', flexGrow: 1 }}>
          <div
            css={{
              width: '40%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRight: `1px solid ${colors.contrast}`,
            }}
          >
            <div
              css={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                flexShrink: 0,
                height: 40,
                borderBottom: `1px solid ${colors.contrast}`,
                ...barStyle,
              }}
            >
              <Typography
                variant="body2"
                css={{ flexGrow: 1, textAlign: 'left', opacity: 0.7 }}
              >
                Input code:
              </Typography>
              <Select
                disableUnderline
                css={{
                  marginLeft: 'auto',
                  marginRight: 10,
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
            </div>
            <div css={{ padding: 15, flexGrow: 1 }}>
              <MonacoEditor
                options={{
                  renderLineHighlightOnlyWhenFocus: true,
                  overviewRulerBorder: false,
                  hideCursorInOverviewRuler: true,
                  automaticLayout: true,
                  minimap: { enabled: false },
                  scrollbar: { vertical: 'hidden' },
                }}
                theme={monacoTheme}
                language="typescript"
                value={state.code}
                onChange={(val) => (state.code = val)}
              />
            </div>
          </div>
          <div
            css={{
              width: '60%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              css={{
                display: 'flex',
                alignItems: 'center',
                padding: 5,
                flexShrink: 0,
                height: 40,
                borderBottom: `1px solid ${colors.contrast}`,
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
                Output code:
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
                value={state.tab}
                onChange={(e, value) => (state.tab = value)}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Vue" value="vue" />
                <Tab label="React" value="react" />
                <Tab label="Liquid" value="liquid" />
                <Tab label="JSON" value="json" />
              </Tabs>
            </div>
            <div>
              <div css={{ padding: 15 }}>
                <MonacoEditor
                  height={outputMonacoEditorSize}
                  options={{
                    automaticLayout: true,
                    overviewRulerBorder: false,
                    highlightActiveIndentGuide: false,
                    foldingHighlight: false,
                    renderLineHighlightOnlyWhenFocus: true,
                    occurrencesHighlight: false,
                    readOnly: true,
                    minimap: { enabled: false },
                    renderLineHighlight: 'none',
                    selectionHighlight: false,
                    scrollbar: { vertical: 'hidden' },
                  }}
                  theme={monacoTheme}
                  language={
                    state.tab === 'json' || state.tab === 'builder'
                      ? 'json'
                      : state.tab === 'react'
                      ? 'typescript'
                      : 'html'
                  }
                  value={state.output}
                />
              </div>
            </div>
            <div
              css={{
                borderBottom: `1px solid ${colors.contrast}`,
                borderTop: `1px solid ${colors.contrast}`,
                alignItems: 'center',
                display: 'flex',
                ...barStyle,
              }}
            >
              <Typography
                variant="body2"
                css={{
                  flexGrow: 1,
                  textAlign: 'left',
                  padding: '10px 15px',
                  color: theme.darkMode
                    ? 'rgba(255, 255, 255, 0.7)'
                    : 'rgba(0, 0, 0, 0.7)',
                }}
              >
                No-code tool interop:
              </Typography>
              {state.pendingBuilderChange && (
                <Button
                  css={{ marginRight: 30 }}
                  onClick={() => state.applyPendingBuilderChange()}
                  color="primary"
                  variant="outlined"
                  size="small"
                >
                  Save
                </Button>
              )}
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
                value={state.noCodeTab}
                onChange={(e, value) => (state.noCodeTab = value)}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Builder.io" value="builder" />
                <Tab label="Figma" value="figma" />
              </Tabs>
            </div>
            <div
              css={{
                flexGrow: 1,
                '& builder-editor': {
                  width: '100%',
                  filter: theme.darkMode ? 'invert(0.89)' : '',
                  transition: 'filter 0.2s ease-in-out',
                  height: '100%',
                  display: state.noCodeTab === 'builder' ? undefined : 'none ',

                  '&:hover': {
                    ...(theme.darkMode && {
                      filter: 'invert(0)',
                    }),
                  },
                },
              }}
            >
              <BuilderEditor
                onChange={(e: CustomEvent) => {
                  if (useSaveButton) {
                    if (document.activeElement?.tagName === 'IFRAME') {
                      state.pendingBuilderChange = e.detail;
                    }
                  } else {
                    state.applyPendingBuilderChange(e.detail);
                  }
                }}
                data={builderData}
                options={builderOptions}
              />
              {state.noCodeTab === 'figma' && (
                <iframe
                  title="figma-embed"
                  css={{
                    height: '100%',
                    width: '100%',
                    border: 0,
                  }}
                  src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2Fn0MTjxKKcD7IHN0uDMVdHB%2FUntitled%3Fnode-id%3D0%253A1"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  });
}
