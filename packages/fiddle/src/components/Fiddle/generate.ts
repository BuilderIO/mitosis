type Transpiler = import('@builder.io/mitosis').Transpiler<string>;

export const generateCode = async ({
  output,
  options,
}: {
  output: string;
  options: any;
}): Promise<Transpiler> => {
  const mitosisCore = await import('@builder.io/mitosis');

  const {
    compileAwayBuilderComponents,
    mapStyles,
    componentToLiquid,
    componentToAlpine,
    componentToHtml,
    componentToCustomElement,
    componentToPreact,
    componentToLit,
    componentToRsc,
    componentToQwik,
    componentToReact,
    componentToStencil,
    componentToMarko,
    componentToSwift,
    componentToReactNative,
    componentToTemplate,
    componentToSolid,
    componentToAngular,
    componentToSvelte,
    componentToMitosis,
    componentToBuilder,
    componentToVue,
  } = mitosisCore;

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
  const allOptions = { plugins, ...options };
  switch (output) {
    case 'liquid':
      return componentToLiquid(allOptions);
    case 'alpine':
      return componentToAlpine(allOptions);
    case 'html':
      return componentToHtml(allOptions);
    case 'webcomponents':
      return componentToCustomElement(allOptions);
    case 'preact':
      return componentToPreact(allOptions);
    case 'lit':
      return componentToLit(allOptions);
    case 'rsc':
      return componentToRsc(allOptions);
    case 'qwik':
      return componentToQwik(allOptions);
    case 'react':
      return componentToReact(allOptions);
    case 'stencil':
      return componentToStencil(allOptions);
    case 'marko':
      return componentToMarko(allOptions);
    case 'swift':
      return componentToSwift();
    case 'reactNative':
      return componentToReactNative(allOptions);
    case 'template':
      return componentToTemplate(allOptions);
    case 'solid':
      return componentToSolid(allOptions);
    case 'angular':
      return componentToAngular(allOptions);
    case 'svelte':
      return componentToSvelte(allOptions);
    case 'mitosis':
      return componentToMitosis();
    case 'json':
      return ({ component }) => JSON.stringify(component, null, 2);
    case 'builder':
      return (args) => JSON.stringify(componentToBuilder()(args), null, 2);
    case 'vue':
      return componentToVue(allOptions);
    default:
      throw new Error('unexpected Output ' + output);
  }
};
