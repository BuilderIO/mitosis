import { RuleTester } from 'eslint';
import rule from '../jsx-callback-arrow-function';

const opts = {
  filename: 'component.lite.tsx',
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
} as const;

var ruleTester = new RuleTester();

ruleTester.run('jsx-callback-arrow-function', rule, {
  valid: [
    { ...opts, code: '<button/>', ...opts },
    { ...opts, code: '<button type="button"/>', ...opts },
    { ...opts, code: '<button onClick={ event => doSomething(event) }/>' },
    { ...opts, code: '<button onClick={ event => doSomething() }/>' },
    { ...opts, code: '<button onClick={ event => {} }/>' },
    { ...opts, code: '<button onClick={ () => doSomething() }/>', ...opts },
    // Doesn't apply to attributes that doesn't match /^on[A-Z]/
    { ...opts, code: '<button onsomething={ null }/>' },
    // Doesn't apply to none mitosis files
    {
      ...opts,
      code: '<button onClick={ null }/>',
      filename: 'file.jsx',
    },
  ],

  invalid: [
    // Doesn't accept regular function as a callback
    {
      ...opts,
      code: '<button onClick={ function(event) {} }/>',
      output: '<button onClick={ (event)=>{} }/>',
      errors: ['Callback value must be an arrow function expression'],
    },
    // Doesn't accept null as a callback
    {
      ...opts,
      code: '<button onClick={ null }/>',
      output: '<button onClick={ (event)=>{} }/>',
      errors: ['Callback value must be an arrow function expression'],
    },
    // Doesn't accept a string as a callback
    {
      ...opts,
      code: '<button onClick={ "string" }/>',
      output: '<button onClick={ (event)=>{} }/>',
      errors: ['Callback value must be an arrow function expression'],
    },
    // Doesn't accept a number as a callback
    {
      ...opts,
      code: '<button onClick={ 1 }/>',
      output: '<button onClick={ (event)=>{} }/>',
      errors: ['Callback value must be an arrow function expression'],
    },
    // Doesn't accept a boolean as a callback
    {
      ...opts,
      code: '<button onClick={ true }/>',
      output: '<button onClick={ (event)=>{} }/>',
      errors: ['Callback value must be an arrow function expression'],
    },
    // Doesn't accept an object as a callback
    {
      ...opts,
      code: '<button onClick={ {} }/>',
      output: '<button onClick={ (event)=>{} }/>',
      errors: ['Callback value must be an arrow function expression'],
    },
    // Doesn't accept an array as a callback
    {
      ...opts,
      code: '<button onClick={ [] }/>',
      output: '<button onClick={ (event)=>{} }/>',
      errors: ['Callback value must be an arrow function expression'],
    },
    // Can handle events that starts that matches /^on[A-Z]/
    {
      ...opts,
      code: '<button onBlur={ [] }/>',
      output: '<button onBlur={ (event)=>{} }/>',
      errors: ['Callback value must be an arrow function expression'],
    },
    {
      ...opts,
      code: '<button onChange={ [] }/>',
      output: '<button onChange={ (event)=>{} }/>',
      errors: ['Callback value must be an arrow function expression'],
    },
  ],
});
