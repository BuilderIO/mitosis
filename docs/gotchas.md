<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Table of contents**

- [Gotchas and limitations](#gotchas-and-limitations)
  - [Defining variables with the same name as a state property will shadow it](#defining-variables-with-the-same-name-as-a-state-property-will-shadow-it)
  - [Async methods can't be defined on "state"](#async-methods-cant-be-defined-on-state)
  - [Callback implicitly have an "event" arg](#callback-implicitly-have-an-event-arg)
  - [Functions can't be passed by reference to JSX callbacks](#functions-cant-be-passed-by-reference-to-jsx-callbacks)
  - [Can't assign "params" to "state"](#cant-assign-"params"-to-"state")
  - [Can't assign function output to "state"](#cant-assign-function-output-to-"state")
  - [Can't destructure assignment from state](#cant-destructure-assignment-from-state)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Gotchas and limitations

### Defining variables with the same name as a state property will shadow it

_Mitosis input_

```typescript
export default function MyComponent() {
  const state = useState({
    foo: 'bar',

    doSomething() {
      const foo = state.foo;
    },
  });
}
```

_Mitosis output_

```typescript
import { useState } from 'react';

export default function MyComponent(props) {
  const [foo, setFoo] = useState(() => 'bar');
  function doSomething() {
    const foo = foo;
  }

  return <></>;
}
```

**Work around**

Use a different variable name

_Mitosis input_

```typescript
export default function MyComponent() {
  const state = useState({
    foo: 'bar',

    doSomething() {
      const foo_ = state.foo;
    },
  });
}
```

_Mitosis output_

```typescript
import { useState } from 'react';

export default function MyComponent(props) {
  const [foo, setFoo] = useState(() => 'bar');
  function doSomething() {
    const foo_ = foo;
  }

  return <></>;
}
```

### Async methods can't be defined on "state"

_Mitosis input_

```typescript
export default function MyComponent() {
  const state = useState({
    async doSomethingAsync(event) {
      //  ^^^^^^^^^^^^^^^^^^^^^^^^^
      //  Fails to parse this line
      return;
    },
  });
}
```

**Work around**

You can either:

a. Use promises in this context instead or
b. Use an immediately invoked async function

_Mitosis input_

```typescript
export default function MyComponent() {
  const state = useState({
    doSomethingAsync(event) {
      void (async function () {
        const response = await fetch(); /* ... */
      })();
    },
  });
}
```

_Mitosis output_

```typescript
import { useState } from 'react';

export default function MyComponent(props) {
  function doSomethingAsync(event) {
    void (async function () {
      const response = await fetch();
    })();
  }

  return <></>;
}
```

### Callback implicitly have an "event" arg

Regardless of what you make name the argument to a callback, it will be
renamed in the output to `event`.

_Mitosis input_

```typescript
export default function MyComponent() {
  return <input onClick={(e) => myCallback(e)} />;
}
```

_Mitosis output_

```typescript
export default function MyComponent(props) {
  return (
    <>
      <input
        onClick={(event) => {
          myCallback(e);
        }}
      />
    </>
  );
}
```

### Functions can't be passed by reference to JSX callbacks

_Mitosis input_

```typescript
export default function MyComponent() {
  const state = useState({
    myCallback(event) {
      // do something
    },
  });

  return <input onClick={state.myCallback} />;
}
```

_Mitosis output_

```typescript
import { useState } from 'react';

export default function MyComponent(props) {
  function myCallback(event) {
    // do something
  }

  return (
    <>
      <input
        onClick={(event) => {
          myCallback;
        }}
      />
    </>
  );
}
```

**Work around**

Define an anonymous function in the callback

_Mitosis input_

```typescript
export default function MyComponent() {
  const state = useState({
    myCallback(event) {
      // do something
    },
  });

  return <input onClick={(event) => state.myCallback(event)} />;
}
```

_Mitosis output_

```typescript
import { useState } from 'react';

export default function MyComponent(props) {
  function myCallback(event) {
    // do something
  }

  return (
    <>
      <input
        onClick={(event) => {
          myCallback(event);
        }}
      />
    </>
  );
}
```

### Can't assign "params" to "state"

JSX lite parsing fails on referencing `props` in a call to `useState`.

_Mitosis input_

```typescript
export default function MyComponent(props) {
  const state = useState({ text: props.text });
  //                             ^^^^^^^^^^
  //                             Could not JSON5 parse object
}
```

**Work around**

Use _onMount_:

_Mitosis input_

```typescript
export default function MyComponent(props) {
  const state = useState({ text: null });

  onMount(() => {
    state.text = props.text;
  });
}
```

_Mitosis output_

```typescript
import { useState } from 'react';

export default function MyComponent(props) {
  const [text, setText] = useState(() => null);

  useEffect(() => {
    setText(props.text);
  }, []);

  return <></>;
}
```

### Can't assign function output to "state"

JSX lite parsing fails if a state value isn't valid JSON

If the initial state value is a computed value (whether based on `props` or the output of some function), then you cannot inline it. Instead, use a getter method:

_Mitosis input_

```jsx
import { kebabCase } from 'lodash';

export default function MyComponent(props) {
  const state = useState({
    name: kebabCase('Steve'),
    //    ^^^^^^^^^
    //    Could not JSON5 parse object
  });

  return (
    <div>
      <h2>Hello, {state.name}</h2>
    </div>
  );
}
```

**Work around**

Use a getter method:

_Mitosis input_

```jsx
import { kebabCase } from 'lodash';

export default function MyComponent(props) {
  const state = useState({
    get name() {
      return kebabCase('Steve');
    },
  });

  return (
    <div>
      <h2>Hello, {state.name}</h2>
    </div>
  );
}
```

_Mitosis output_

```jsx
import { kebabCase } from 'lodash';

export default function MyComponent(props) {
  function name() {
    return kebabCase('Steve');
  }

  return (
    <div>
      <h2>
        Hello,
        {name()}
      </h2>
    </div>
  );
}
```

### Can't destructure assignment from state

Destructuring assignment from `state` isn't currently supported, and is
ignored by the compiler.

_Mitosis input_

```typescript
export default function MyComponent() {
  const state = useState({ foo: '1' });

  onMount(() => {
    const { foo } = state;
  });
}
```

_Mitosis output_

```typescript
import { useState } from 'react';

export default function MyComponent(props) {
  const [foo, setFoo] = useState(() => '1');

  useEffect(() => {
    const { foo } = state;
  }, []);

  return <></>;
}
```

**Work around**

Use standard assignment instead for now.

_Mitosis input_

```typescript
export default function MyComponent() {
  const state = useState({ foo: '1' });

  onMount(() => {
    const foo = state.foo;
  });
}
```

_Mitosis output_

```typescript
import { useState } from 'react';

export default function MyComponent(props) {
  const [foo, setFoo] = useState(() => '1');

  useEffect(() => {
    const foo = foo;
  }, []);

  return <></>;
}
```
