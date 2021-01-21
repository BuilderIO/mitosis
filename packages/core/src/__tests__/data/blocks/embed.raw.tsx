import { useState, useRef } from '@jsx-lite/core';

export interface EmbedProps {
  content: string;
}

export default function Embed(props: EmbedProps) {
  const elem = useRef();

  const state = useState({
    scriptsInserted: new Set<string>(),
    scriptsRun: new Set<string>(),
    findAndRunScripts() {
      if (elem && typeof window !== 'undefined') {
        const scripts = elem.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
          const script = scripts[i];
          if (script.src) {
            if (state.scriptsInserted.has(script.src)) {
              continue;
            }
            state.scriptsInserted.add(script.src);
            const newScript = document.createElement('script');
            newScript.async = true;
            newScript.src = script.src;
            document.head.appendChild(newScript);
          } else {
            if (state.scriptsRun.has(script.innerText)) {
              continue;
            }
            state.scriptsRun.add(script.innerText);
            try {
              new Function(script.innerText)();
            } catch (error) {
              console.warn('Builder custom code component error:', error);
            }
          }
        }
      }
    },
  });

  return (
    <div ref={elem} className="builder-embed">
      {props.content}
    </div>
  );
}
