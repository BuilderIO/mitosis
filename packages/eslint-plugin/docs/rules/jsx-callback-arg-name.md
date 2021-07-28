# jsx-callback-arg-name (jsx-callback-arg-name)

This rule warns about a Mitosis limitation.

## Rule Details

This rule aims to warn you about using an unsupported callback parameter name.

Examples of **incorrect** code for this rule:

```js

<button onClick={ e => console.log(e) }/>

<button onClick={ function (e) {} }/>

<button onClick={ function foobar(e) {} }/>
```

Examples of **correct** code for this rule:

```js
<button/>

<button type="button"/>

<button onClick={ null }/>

<button onClick={ "string" }/>

<button onClick={ event => doSomething(event) }/>

<button onClick={ () => doSomething() }/>

<button onClick={ function(event) {} }/>
```

<!-- ### Options -->

<!-- If there are any options, describe them here. Otherwise, delete this section. -->

<!-- ## When Not To Use It -->

<!-- Give a short description of when it would be appropriate to turn off this rule. -->

<!-- ## Further Reading -->

<!-- If there are other links that describe the issue this rule addresses, please include them here in a bulleted list. -->
