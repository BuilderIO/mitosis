import { SvelteComponentTyped } from "svelte";
export interface ItemListProps {
    list: string[];
    deleteItem: (k: number) => void;
}
declare const __propDef: {
    props: {
        list: ItemListProps["list"];
        deleteItem: ItemListProps["deleteItem"];
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type ItemListProps = typeof __propDef.props;
export type ItemListEvents = typeof __propDef.events;
export type ItemListSlots = typeof __propDef.slots;
export default class ItemList extends SvelteComponentTyped<ItemListProps, ItemListEvents, ItemListSlots> {
}
export {};
