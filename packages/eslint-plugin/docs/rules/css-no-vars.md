# css-no-vars (css-no-vars)

This rule warns about a Mitosis limitation.

## Rule Details

This rule aims to warn you about using an unsupported values for the css attribute.

Examples of **incorrect** code for this rule:

```js
    <button css={{ color: red }} />

    <button css={{ fontSize: 10, color: red }} />

    <button css={"sting"} />

    <button css={1} />

    <button css={true} />

    <button css={{color: a ? "red" : "green" }} />
```

Examples of **correct** code for this rule:

```js
<button />

<button type="button" />

<button css={{ color: "red" }} />,

<button css={{ fontSize: 12 }} />,
```
