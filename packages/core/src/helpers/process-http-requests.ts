import { MitosisComponent } from '..';

export function processHttpRequests(json: MitosisComponent) {
  const httpRequests: Record<string, string> | undefined = (json.meta
    .useMetadata as any)?.httpRequests;

  let onMount = json.hooks.onMount?.code ? json.hooks.onMount : { code: '' };

  if (httpRequests) {
    for (const key in httpRequests) {
      if (!json.state[key]) {
        json.state[key] = null;
      }

      const value = httpRequests[key];

      // TODO: unravel our proxy. aka parse out methods, header, etc
      // and remove our proxy from being used anymore
      onMount.code += `
        fetch("${value}").then(res => res.json()).then(result => {
          state.${key} = result;
        })
      `;
    }
  }

  json.hooks.onMount = onMount;
}
