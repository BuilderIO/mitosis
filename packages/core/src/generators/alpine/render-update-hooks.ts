import { curry } from "lodash";
import { extendedHook, MitosisComponent } from "src/types/mitosis-component";

const extractCode = (hook: extendedHook) => hook.code;
function renderRootUpdateHook(hooks: extendedHook[], output: string) {
    if (hooks.length === 0) {
        return output
    }
    const str = `onUpdate() {
        ${hooks.map(extractCode).join('\n')}
    }`;

    return output.replace(/(,)(\s*}?)$/g, `$1${str}$2`);
}

function getRootUpdateHooks(json: MitosisComponent) {
    return (json.hooks.onUpdate ?? []).filter(hook => hook.deps == '') 
}

export function hasRootUpdateHook(json: MitosisComponent): boolean {
    return getRootUpdateHooks(json).length > 0
}

export const renderUpdateHooks = curry((json: MitosisComponent, output: string) => {
    return renderRootUpdateHook(getRootUpdateHooks(json), output);
});