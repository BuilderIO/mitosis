import { SvelteComponentTyped } from "svelte";
export interface State {
    list: string[];
    newItemName: string;
    setItemName: any;
    addItem: () => void;
    deleteItem: (k: number) => void;
}
export interface TodoAppProps {
}
declare const __propDef: {
    props: {};
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type TodoAppProps = typeof __propDef.props;
export type TodoAppEvents = typeof __propDef.events;
export type TodoAppSlots = typeof __propDef.slots;
export default class TodoApp extends SvelteComponentTyped<TodoAppProps, TodoAppEvents, TodoAppSlots> {
}
export {};
