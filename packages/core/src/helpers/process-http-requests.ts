import { MitosisComponent } from '..';

export function processHttpRequests(json: MitosisComponent) {
  const httpRequests = json?.meta?.useMetadata?.httpRequests;

  if (httpRequests) {
    for (const key in httpRequests) {
      if (!json.state[key]) {
        json.state[key] = { code: 'null', type: 'property', propertyType: 'normal' };
      }

      const value = httpRequests[key];

      // TODO: unravel our proxy. aka parse out methods, header, etc
      // and remove our proxy from being used anymore
      json.hooks.onMount.push({
        code: `
        fetch("${value}").then(res => res.json()).then(result => {
          state.${key} = result;
        })
        `,
      });
    }
  }
}
