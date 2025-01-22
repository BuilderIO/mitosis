import type { MitosisComponent } from '@/types/mitosis-component';

export const addCodeNgAfterViewInit = (json: MitosisComponent, code: string) => {
  if (!json.compileContext) {
    json.compileContext = {
      angular: {
        hooks: {
          ngAfterViewInit: {
            code: '',
          },
        },
      },
    };
  }

  json.compileContext!.angular!.hooks!.ngAfterViewInit.code += code;
};

/**
 * Adds code to the `onUpdate` hook of a MitosisComponent.
 *
 * @param {MitosisComponent} root - The root MitosisComponent.
 * @param {string} code - The code to be added to the `onUpdate` hook.
 */
export const addCodeToOnUpdate = (root: MitosisComponent, code: string) => {
  root.hooks.onUpdate = root.hooks.onUpdate || [];
  root.hooks.onUpdate.push({
    code,
  });
};

/**
 * Adds code to the `onInit` hook of a MitosisComponent.
 *
 * @param {MitosisComponent} root - The root MitosisComponent.
 * @param {string} code - The code to be added to the `onInit` hook.
 */
export const addCodeToOnInit = (root: MitosisComponent, code: string) => {
  if (!root.hooks.onInit?.code) {
    root.hooks.onInit = { code: '' };
  }
  root.hooks.onInit.code += `\n${code};`;
};

/**
 * Creates a reactive state in Angular.
 * Initializes the state with `null` because we cannot access `state.` or `props.` properties before the component is initialized.
 * Adds the code (init/re-init code) to the `onInit` and `onUpdate` hooks.
 * @param root The root MitosisComponent.
 * @param stateName The name of the reactive state.
 * @param code The code to be added to the onInit and onUpdate hooks.
 */
export const makeReactiveState = (root: MitosisComponent, stateName: string, code: string) => {
  root.state[stateName] = { code: 'null', type: 'property' };
  addCodeToOnInit(root, code);
  addCodeToOnUpdate(root, code);
};
