import { useLocalStore, useObserver } from 'mobx-react-lite';
import React from 'react';
import { getQueryParam } from './functions/get-query-param';
import MonacoEditor from 'react-monaco-editor';
import { useReaction } from './functions/use-reaction';
import { setQueryParam } from './functions/set-query-param';

export default function Fiddle() {
  const state = useLocalStore(() => ({
    code: getQueryParam('code') || '',
  }));

  useReaction(
    () => state.code,
    (code) => setQueryParam('code', code),
  );

  return useObserver(() => (
    <div css={{ display: 'flex', height: '100vh' }}>
      <div
        css={{
          width: '50%',
          height: '100%',
        }}
      >
        <MonacoEditor
          options={{
            automaticLayout: true,
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
        <div css={{ height: '50%' }}>{/* Top right pane */}</div>
        <div css={{ height: '50%' }}>{/* Bottom right pane */}</div>
      </div>
    </div>
  ));
}
