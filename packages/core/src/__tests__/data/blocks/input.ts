export const inputBlock = `
import React from 'react';
import { Builder } from '@builder.io/sdk';
import { withBuilder } from '../../functions/with-builder';

export interface FormInputProps {
  type?: string;
  attributes?: any;
  name?: string;
  value?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}

export default function FormInputComponent(props: FormInputProps) {
  return (
    <input
      key={Builder.isEditing && props.defaultValue ? props.defaultValue : 'default-key'}
      placeholder={props.placeholder}
      type={props.type}
      name={props.name}
      value={props.value}
      defaultValue={props.defaultValue}
      required={props.required}
      {...props.attributes}
    />
  );
}
`