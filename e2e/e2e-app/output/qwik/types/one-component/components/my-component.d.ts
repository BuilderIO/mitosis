export interface State {
    list: string[];
    newItemName: string;
    setItemName: any;
    addItem: any;
}
export declare const setItemName: (props: any, state: any, event: any) => void;
export declare const addItem: (props: any, state: any) => void;
export declare const MyComponent: import("@builder.io/qwik").Component<any>;
export default MyComponent;
export declare const STYLES = "\n.div-MyComponent {\n  padding: 10px;\n}.button-MyComponent {\n  margin: 10px 0;\n}.li-MyComponent {\n  padding: 10px;\n}";
