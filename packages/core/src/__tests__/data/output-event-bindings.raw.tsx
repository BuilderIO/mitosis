import { useStore } from '@builder.io/mitosis';

export interface TestComponentProps {
    toggled: boolean;
    myToggleChange: (value: any) => void;
}

export function MyComponent(props: TestComponentProps) {
    const state = useStore({
        _toggled: false
    });

    function handleToggleSwitch(): void {
        state._toggled = !state._toggled;
        props.toggled = !props.toggled;

        if (props.myToggleChange) {
            props.myToggleChange(state._toggled);
        }
    }

    return (
        <button type="button" onClick={() => handleToggleSwitch()}>
            Toggled [{state._toggled}]
        </button>
    );
}

export default function outputEventBindingExample(props: TestComponentProps) {
    const state = useStore({
        toggledParent: false,
        testToggle: (val: boolean) => {
            console.log('Inverse Event: ', val);
            state.toggledParent = val;
        },
    });

    return (
        <div>
            <MyComponent
                toggled={state.toggledParent}
                myToggleChange={(val) => state.testToggle(val)}
            ></MyComponent>
        </div>
    );
}