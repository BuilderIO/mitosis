import { useState, useRef, onMount } from '@builder.io/mitosis';

export interface EmbedProps {
  content: string;
}

export default function Embed(props: EmbedProps) {
  const elem = useRef();

  const state = useState({
    scriptsInserted: [] as string[],
    scriptsRun: [] as string[],

    findAndRunScripts() {
      // TODO: Move this function to standalone one in '@builder.io/utils'
      if (elem && typeof window !== 'undefined') {
        /** @type {HTMLScriptElement[]} */
        const scripts = elem.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
          const script = scripts[i];
          if (script.src) {
            if (state.scriptsInserted.includes(script.src)) {
              continue;
            }
            state.scriptsInserted.push(script.src);
            const newScript = document.createElement('script');
            newScript.async = true;
            newScript.src = script.src;
            document.head.appendChild(newScript);
          } else if (
            !script.type ||
            [
              'text/javascript',
              'application/javascript',
              'application/ecmascript',
            ].includes(script.type)
          ) {
            if (state.scriptsRun.includes(script.innerText)) {
              continue;
            }
            try {
              state.scriptsRun.push(script.innerText);
              new Function(script.innerText)();
            } catch (error) {
              console.warn('`Embed`: Error running script:', error);
            }
          }
        }
      }
    },
  });

  onMount(() => {
    state.findAndRunScripts();
  });

  return <div ref={elem} class="builder-embed" innerHTML={props.content}></div>;
}
