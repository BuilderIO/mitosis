import { curry } from "lodash";
import { extendedHook, MitosisComponent } from "../../types/mitosis-component";

const extractCode = (hook: extendedHook) => hook.code;
function renderRootUpdateHook(hooks: extendedHook[], output: string) {
    if (hooks.length === 0) {
        return output
    }
    const str = `onUpdate() {
        ${hooks.map(extractCode).join('\n')}
    }`;

    return output.replace(/,?(\s*})$/, `,\n${str}$1`);
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

function getWatchHooks(json: MitosisComponent) {
    return (json.hooks.onUpdate ?? []).filter(hook => hook.deps?.match(/state|this/)) 
}

export const hasWatchHooks = (json: MitosisComponent): boolean => {
    return getWatchHooks(json).length > 0
}

function renderWatchHook(hook: extendedHook): string {
    const deps = (hook.deps ?? '')?.slice(1).slice(0, -1).split(', ')
    .filter(dep => dep.match(/state|this/));


    return deps.map(dep => `this.$watch('${dep.replace(/(state|this)\./, '')}', (value, oldValue) => { ${hook.code} });`).join('\n')
}

export const renderWatchHooks = (json: MitosisComponent): string => {
    return hasWatchHooks(json)
    ? getWatchHooks(json).map(renderWatchHook).join('\n')
    : ''
}