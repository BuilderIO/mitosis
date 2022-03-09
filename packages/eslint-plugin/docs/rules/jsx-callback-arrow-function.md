# jsx-callback-arrow-function (jsx-callback-arrow-function)

This rule warns about a Mitosis limitation.

## Rule Details

This rule aims to warn you if you pass anything to a callback other than arrow function.

Examples of **incorrect** code for this rule:

```js
      <button onClick={ function(event) {} }/>

      <button onClick={ null }/>

      <button onClick={ "string" }/>

      <button onClick={ 1 }/>

      <button onClick={ true }/>

      <button onClick={ {} }/>

      <button onClick={ [] }/>

      <button onBlur={ [] }/>

      <button onChange={ [] }/>
```

Examples of **correct** code for this rule:

```js
   <button/>

   <button type="button"/>

   <button onClick={ event => doSomething(event) }/>

   <button onClick={ event => doSomething() }/>

   <button onClick={ event => {} }/>

   <button onClick={ () => doSomething() }/>
```
