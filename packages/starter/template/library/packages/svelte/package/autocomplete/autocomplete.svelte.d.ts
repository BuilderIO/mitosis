import { SvelteComponentTyped } from "svelte";
export type Props = {
    getValues: (input: string) => Promise<any[]>;
    renderChild?: any;
    transformData: (item: any) => string;
};
declare const __propDef: {
    props: {
        transformData: Props["transformData"];
        renderChild: Props["renderChild"];
        getValues: Props["getValues"];
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type AutocompleteProps = typeof __propDef.props;
export type AutocompleteEvents = typeof __propDef.events;
export type AutocompleteSlots = typeof __propDef.slots;
export default class Autocomplete extends SvelteComponentTyped<AutocompleteProps, AutocompleteEvents, AutocompleteSlots> {
}
export {};
