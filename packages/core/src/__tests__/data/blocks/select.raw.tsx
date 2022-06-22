import { For } from '@builder.io/mitosis';
import { Builder } from '@builder.io/sdk';

export interface FormSelectProps {
  options?: { name?: string; value: string }[];
  attributes?: any;
  name?: string;
  value?: string;
  defaultValue?: string;
}

export default function SelectComponent(props: FormSelectProps) {
  return (
    <select
      {...props.attributes}
      value={props.value}
      key={Builder.isEditing && props.defaultValue ? props.defaultValue : 'default-key'}
      defaultValue={props.defaultValue}
      name={props.name}
    >
      <For each={props.options}>
        {(option, index) => (
          <option value={option.value} data-index={index}>
            {option.name || option.value}
          </option>
        )}
      </For>
    </select>
  );
}
