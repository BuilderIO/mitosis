import { For } from '@jsx-lite/core';
import { Builder } from '@builder.io/sdk';

export interface FormSelectProps {
  options?: { name?: string; value: string }[];
  attributes?: any;
  name?: string;
  value?: string;
  defaultValue?: string;
}

export function SelectComponent(props: FormSelectProps) {
  return (
    <select
      value={props.value}
      key={
        Builder.isEditing && props.defaultValue
          ? props.defaultValue
          : 'default-key'
      }
      defaultValue={props.defaultValue}
      name={props.name}
      {...props.attributes}
    >
      <For each={props.options}>
        {(option) => (
          <option value={option.value}>{option.name || option.value}</option>
        )}
      </For>
    </select>
  );
}
