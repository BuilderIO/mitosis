import { useLocalStore, useObserver } from 'mobx-react-lite';
import React from 'react';
import { getQueryParam } from './functions/get-query-param';
import MonacoEditor from 'react-monaco-editor';
import { useReaction } from './functions/use-reaction';
import { setQueryParam } from './functions/set-query-param';
import * as monaco from 'monaco-editor';
import {
  parse,
  componentToVue,
  componentToReact,
  componentToLiquid,
} from '@jsx-lite/core';
import { MenuItem, Select, Tab, Tabs } from '@material-ui/core';

monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: true,
  noSyntaxValidation: true, // This line disables errors in jsx tags like <div>, etc.
});

// I don't think the following makes any difference
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  // jsx: 'react',
  jsx: monaco.languages.typescript.JsxEmit.Preserve,
  reactNamespace: 'React',
  allowNonTsExtensions: true,
  allowJs: true,
  target: monaco.languages.typescript.ScriptTarget.Latest,
});

const defaultCode = `
import { useState } from '@jsx-lite/core';

export default function MyComponent() {
  const state = useState({
    name: 'Steve',
  });

  return (
    <div>
      <input
        value={state.name}
        onChange={(event) => (state.name = event.target.value)}
      />
      Hello! I can run in React, Vue, Solid, or Liquid!
    </div>
  );
}
`;

const templates: { [key: string]: string } = {
  basic: defaultCode,
};

export default function Fiddle() {
  const state = useLocalStore(() => ({
    code: getQueryParam('code') || defaultCode,
    output: '',
    secondOutput: '',
    tab: 'vue',
    secondTab: 'liquid',
    updateOutput() {
      try {
        const json = parse(state.code);
        state.output =
          state.tab === 'liquid'
            ? componentToLiquid(json)
            : state.tab === 'react'
            ? componentToReact(json)
            : componentToVue(json);

        state.secondOutput =
          state.secondTab === 'liquid'
            ? componentToLiquid(json)
            : state.secondTab === 'react'
            ? componentToReact(json)
            : componentToVue(json);
      } catch (err) {
        console.warn(err);
      }
    },
  }));

  useReaction(
    () => state.code,
    (code) => setQueryParam('code', code),
    { fireImmediately: false },
  );
  useReaction(
    () => state.tab,
    () => state.updateOutput(),
  );
  useReaction(
    () => state.secondTab,
    () => state.updateOutput(),
  );

  useReaction(
    () => state.code,
    (code) => {
      state.updateOutput();
    },
    { delay: 1000 },
  );

  return useObserver(() => (
    <div css={{ display: 'flex', height: '100vh' }}>
      <div
        css={{
          width: '50%',
          height: '100%',
        }}
      >
        <Select
          placeholder="Templates"
          onChange={(e) => {
            const template = templates[e.target.value as string];
            if (template) {
              state.code = template;
            }
          }}
        >
          {Object.keys(templates).map((key) => (
            <MenuItem
              value={key}
              css={{
                textTransform: 'capitalize',
              }}
            >
              {key}
            </MenuItem>
          ))}
        </Select>
        <MonacoEditor
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
          }}
          theme="vs-dark"
          language="typescript"
          value={state.code}
          onChange={(val) => (state.code = val)}
        />
      </div>
      <div
        css={{
          width: '50%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div css={{ height: '50%' }}>
          <Tabs
            value={state.tab}
            onChange={(e, value) => (state.tab = value)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Vue" value="vue" />
            <Tab label="React" value="react" />
            <Tab label="Liquid" value="liquid" />
          </Tabs>
          <MonacoEditor
            options={{
              automaticLayout: true,
              readOnly: true,
              minimap: { enabled: false },
            }}
            theme="vs-dark"
            language={state.tab === 'react' ? 'typescript' : 'html'}
            value={state.output}
          />
        </div>
        <div css={{ height: '50%' }}>
          <Tabs
            value={state.secondTab}
            onChange={(e, value) => (state.secondTab = value)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Vue" value="vue" />
            <Tab label="React" value="react" />
            <Tab label="Liquid" value="liquid" />
          </Tabs>
          <MonacoEditor
            options={{
              automaticLayout: true,
              readOnly: true,
              minimap: { enabled: false },
            }}
            theme="vs-dark"
            language={state.secondTab === 'react' ? 'typescript' : 'html'}
            value={state.secondOutput}
          />
        </div>
      </div>
    </div>
  ));
}
