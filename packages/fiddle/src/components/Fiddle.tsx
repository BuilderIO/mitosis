import { Alert } from '@material-ui/lab';
import { useLocalObservable, useObserver } from 'mobx-react-lite';
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
  componentToSolid,
  builderContentToJsxLiteComponent,
  componentToJsxLite,
  liquidToBuilder,
  reactiveScriptRe,
  parseReactiveScript,
} from '@jsx-lite/core';
import {
  Button,
  createMuiTheme,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Tab,
  Tabs,
  ThemeProvider,
  Typography,
} from '@material-ui/core';
import { deleteQueryParam } from '../functions/delete-query-param';
import { defaultCode, templates } from '../constants/templates';
// eslint-disable-next-line import/no-webpack-loader-syntax
import types from 'raw-loader!@jsx-lite/core/dist/jsx';
import { colors } from '../constants/colors';
import { useEventListener } from '../hooks/use-event-lisetener';
import { adapt } from 'webcomponents-in-react';
import { theme } from '../constants/theme';
import { breakpoints } from '../constants/breakpoints';
import { device } from '../constants/device';
import { Show } from './Show';
import { TextLink } from './TextLink';
import { promptUploadFigmaJsonFile } from '../functions/prompt-upload-figma-file';
import { localStorageGet } from '../functions/local-storage-get';
import { localStorageSet } from '../functions/local-storage-set';

const debug = getQueryParam('debug') === 'true';

const AlphaPreviewMessage = () => (
  <ThemeProvider
    theme={createMuiTheme({
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
      This is an early alpha preview, please{' '}
      <TextLink
        css={{ color: 'inherit', textDecoration: 'underline' }}
        href="https://github.com/BuilderIO/jsx-lite/issues"
        target="_blank"
      >
        report bugs and share feedback
      </TextLink>
    </Alert>
  </ThemeProvider>
);

const builderOptions = {
  useDefaultStyles: false,
  hideAnimateTab: true,
  previewUrl: 'https://jsx-lite.builder.io/preview.html',
};

const BuilderEditor = adapt('builder-editor');

const smallBreakpoint = breakpoints.mediaQueries.small;
const responsiveColHeight = 'calc(50vh - 30px)';

const builderEnvParam = getQueryParam('builderEnv');

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

const TabLabelWithIcon = (props: { icon: string; label: string }) => {
  const useIcon = false;
  return (
    <div css={{ display: 'flex', alignItems: 'center' }}>
      {useIcon && <TabLogo src={props.icon} />} {props.label}
    </div>
  );
};

const defaultLiquidCode = `
<!-- Edit this code to see it update the JSX Lite -->
<div>
  <h2>
    Welcome, {{name}}
  </h2>
  {% for product in products %}
    <div>
        {{product.title}}
    </div>
  {% endfor %}
</div>

<!-- Optionally add a reactive script for browser-only reactive state -->
<script reactive>
  export default {
    state: {
      name: 'Steve',
      // This could also be passed from liquid, e.g. {{ products | json }}
      products: [{ title: 'Blue suede shoes' }] 
    }
  }
</script>
`;

// TODO: Build this Fiddle app with JSX Lite :)
export default function Fiddle() {
  const [staticState] = useState(() => ({
    ignoreNextBuilderUpdate: false,
  }));
  const [builderData, setBuilderData] = useState<any>(null);
  const state = useLocalObservable(() => ({
    code: getQueryParam('code') || defaultCode,
    inputCode: defaultLiquidCode,
    output: '',
    outputTab: getQueryParam('outputTab') || 'vue',
    pendingBuilderChange: null as any,
    inputTab: getQueryParam('inputTab') || 'builder',
    builderData: {} as any,
    options: {
      reactStyleType:
        localStorageGet('options.reactStyleType') ||
        ('emotion' as 'emotion' | 'styled-jsx'),
    },
    applyPendingBuilderChange(update?: any) {
      const builderJson = update || state.pendingBuilderChange;
      if (!builderJson) {
        return;
      }
      const jsxJson = builderContentToJsxLiteComponent(builderJson);
      state.code = componentToJsxLite(jsxJson);
      state.pendingBuilderChange = null;
    },
    async parseInputCode() {
      const jsxState = parseReactiveScript(state.inputCode, {
        format: 'html',
      }).state;

      const builderJson = await liquidToBuilder(
        state.inputCode.replace(reactiveScriptRe, ''),
      );

      const jsx = builderContentToJsxLiteComponent({
        data: { blocks: builderJson },
      });
      state.code = componentToJsxLite({
        ...jsx,
        state: jsxState,
      });
    },
    updateOutput() {
      try {
        state.pendingBuilderChange = null;
        staticState.ignoreNextBuilderUpdate = true;
        const json = parseJsx(state.code);
        state.output =
          state.outputTab === 'liquid'
            ? componentToLiquid(json)
            : state.outputTab === 'react'
            ? componentToReact(json, {
                stylesType: state.options.reactStyleType,
              })
            : state.outputTab === 'solid'
            ? componentToSolid(json)
            : state.outputTab === 'json' || state.outputTab === 'builder'
            ? JSON.stringify(json, null, 2)
            : componentToVue(json);

        const newBuilderData = componentToBuilder(json);
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

  useReaction(
    () => state.options.reactStyleType,
    (type) => localStorageSet('options.reactStyleType', type),
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
    () => state.code,
    (code) => {
      state.updateOutput();
    },
    { delay: 1000 },
  );
  useReaction(
    () => state.inputCode,
    (code) => {
      state.parseInputCode();
    },
    { delay: 1000, fireImmediately: false },
  );

  return useObserver(() => {
    const outputMonacoEditorSize = device.small
      ? 'calc(45vh - 50px)'
      : 'calc(45vh - 100px)';
    const inputMonacoEditorSize = 'calc(55vh - 100px)';
    const lightColorInvert = {}; // theme.darkMode ? null : { filter: 'invert(1) ' };
    const monacoTheme = theme.darkMode ? 'vs-dark' : 'vs';
    const barStyle: any = {
      overflow: 'auto',
      whiteSpace: 'nowrap',
      ...(theme.darkMode ? null : { backgroundColor: 'white' }),
    };

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
            <div
              css={{
                marginRight: 'auto',
                [smallBreakpoint]: { display: 'none' },
              }}
            >
              <AlphaPreviewMessage />
            </div>

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
            [smallBreakpoint]: { flexDirection: 'column' },
          }}
        >
          <div
            css={{
              width: '45%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRight: `1px solid ${colors.contrast}`,
              [smallBreakpoint]: {
                width: '100%',
                height: responsiveColHeight,
                overflow: 'hidden',
              },
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
                JSX Lite code:
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
            <div css={{ paddingTop: 15, flexGrow: 1 }}>
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
                height="calc(100vh - 105px)"
                language="typescript"
                value={state.code}
                onChange={(val) => (state.code = val)}
              />
            </div>
          </div>
          <div
            css={{
              width: '55%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              [smallBreakpoint]: {
                width: '100%',
                height: responsiveColHeight,
                overflow: 'hidden',
              },
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
                      label="vue"
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
                <Tab
                  label={
                    <TabLabelWithIcon
                      label="Solid"
                      icon="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F3835d178881b44db8fc51d3569ae97c6"
                    />
                  }
                  value="solid"
                />
                <Tab
                  label={
                    <TabLabelWithIcon
                      label="Liquid"
                      icon="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Ff98433f5a2b747f094bf01e2e88bde08"
                    />
                  }
                  value="liquid"
                />
                <Tab
                  label={
                    <TabLabelWithIcon
                      label="JSON"
                      icon="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fa64744451c9546a085a3ca662f7d5572"
                    />
                  }
                  value="json"
                />
              </Tabs>
            </div>
            <Show when={state.outputTab === 'react'}>
              <div
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                }}
              >
                <Typography
                  variant="body2"
                  css={{ marginRight: 'auto', marginLeft: 10 }}
                >
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
                    value="emotion"
                    control={<Radio color="primary" />}
                    labelPlacement="start"
                    label="Emotion CSS prop"
                  />
                  <FormControlLabel
                    value="styled-jsx"
                    labelPlacement="start"
                    control={<Radio color="primary" />}
                    label="Styled JSX"
                  />
                </RadioGroup>
              </div>
              <Divider />
            </Show>
            <div>
              <div css={{ paddingTop: 15 }}>
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
                    state.outputTab === 'json' || state.outputTab === 'builder'
                      ? 'json'
                      : state.outputTab === 'react' ||
                        state.outputTab === 'solid'
                      ? 'typescript'
                      : 'html'
                  }
                  value={state.output}
                />
              </div>
            </div>
            <Show when={!device.small}>
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
                  Inputs:
                </Typography>
                {state.pendingBuilderChange && (
                  <Button
                    css={{ marginRight: 30 }}
                    onClick={() => state.applyPendingBuilderChange()}
                    color="primary"
                    variant="contained"
                    size="small"
                  >
                    Update JSX
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
                  value={state.inputTab}
                  onChange={(e, value) => (state.inputTab = value)}
                  indicatorColor="primary"
                  textColor="primary"
                >
                  <Tab
                    label={
                      <TabLabelWithIcon
                        label="Builder.io"
                        icon="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F98d1ee2d3215406c9a6a83efc3f59494"
                      />
                    }
                    value="builder"
                  />
                  <Tab
                    label={
                      <TabLabelWithIcon
                        label="Figma"
                        icon="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F2bc3a4ef83644b0a88bc88b4d173d5b0"
                      />
                    }
                    value="figma"
                  />
                  <Tab
                    label={
                      <TabLabelWithIcon
                        label="Liquid"
                        icon="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Ff98433f5a2b747f094bf01e2e88bde08"
                      />
                    }
                    value="liquid"
                  />
                </Tabs>
              </div>
              <div
                css={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  '& builder-editor': {
                    width: '100%',
                    filter: theme.darkMode ? 'invert(0.89)' : '',
                    transition: 'filter 0.2s ease-in-out',
                    height: '100%',
                    display: state.inputTab === 'builder' ? undefined : 'none ',

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
                  env={builderEnvParam || undefined}
                />
                <Show when={state.inputTab === 'figma'}>
                  <div
                    css={{
                      background: colors.background,
                      display: 'flex',
                      flexDirection: 'column',
                      flexGrow: 1,
                      overflow: 'auto',
                      flexShrink: 1,
                    }}
                  >
                    <Paper
                      elevation={0}
                      css={{
                        background: 'transparent',
                        margin: 'auto',
                        maxWidth: 600,
                        padding: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                      }}
                    >
                      <Typography
                        variant="body1"
                        css={{ marginBottom: 15, textAlign: 'center' }}
                      >
                        Import from Figma
                      </Typography>
                      <Paper
                        css={{
                          margin: '0 auto 20px',
                          minHeight: 300,
                          height: '20vh',
                          maxHeight: 400,
                        }}
                      >
                        <video
                          autoPlay
                          muted
                          loop
                          css={{ maxWidth: '100%', maxHeight: '100%' }}
                        >
                          <source
                            src="https://cdn.builder.io/o/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fab055052473c4817b0eae1e92933acc1?alt=media&token=45f450c1-8815-440a-84da-a352644524ad&amp;apiKey=YJIGb4i01jvw0SRdL5Bt"
                            type="video/mp4"
                          />
                        </video>
                      </Paper>
                      <Button
                        css={{ marginBottom: 10 }}
                        fullWidth
                        color="primary"
                        variant="contained"
                        size="large"
                        onClick={async () => {
                          const json = await promptUploadFigmaJsonFile();
                          state.code = componentToJsxLite(
                            await builderContentToJsxLiteComponent(json),
                          );
                          state.inputTab = 'builder';
                        }}
                      >
                        Upload Figma JSON
                      </Button>
                      <ul>
                        <li>
                          Download the{' '}
                          <TextLink
                            target="_blank"
                            href="https://www.figma.com/community/plugin/747985167520967365/HTML-To-Figma"
                          >
                            HTML to Figma plugin
                          </TextLink>
                        </li>
                        <li>
                          Open the plugin (e.g.{' '}
                          <code>
                            {navigator.appVersion.includes('Mac')
                              ? 'cmd'
                              : 'ctrl'}
                            +/
                          </code>{' '}
                          and search "HTML to Figma")
                        </li>
                        <li>
                          From the plugin window, choose "download as JSON"
                        </li>
                        <li>Upload the downloaded JSON above</li>
                      </ul>
                    </Paper>
                  </div>
                </Show>
                <Show when={state.inputTab === 'liquid'}>
                  <MonacoEditor
                    height={inputMonacoEditorSize}
                    options={{
                      automaticLayout: true,
                      overviewRulerBorder: false,
                      highlightActiveIndentGuide: false,
                      foldingHighlight: false,
                      renderLineHighlightOnlyWhenFocus: true,
                      occurrencesHighlight: false,
                      minimap: { enabled: false },
                      renderLineHighlight: 'none',
                      selectionHighlight: false,
                      scrollbar: { vertical: 'hidden' },
                    }}
                    onChange={(value) => {
                      state.inputCode = value;
                    }}
                    theme={monacoTheme}
                    language="html"
                    value={state.inputCode}
                  />
                </Show>
              </div>
            </Show>
          </div>
        </div>
      </div>
    );
  });
}
