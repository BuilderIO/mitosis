---
'@builder.io/mitosis': minor
---

[stencil]: Improve props

- Fix issue with props starting with `on` converted to "wrong" `@Events` - Stencil adds `on` automatically to events
- Remove `children` prop from `@Prop` - Stencil uses `<slot>` for children
- Add [`PropOptions`](https://stenciljs.com/docs/properties#prop-options) to `ToStencilOptions` and `StencilMetadata`. You can use it like this:

```tsx
import { useMetadata } from '@builder.io/mitosis';

useMetadata({
    stencil: {
        propOptions: {
            className: {
                attribute: 'classname',
                mutable: false,
                reflect: false,
            },
        },
    },
});

export default function MyBasicComponent(props: {className:string}) {
    ...
}
```
