import { useMetadata, useState } from '@builder.io/mitosis';

useMetadata({
  angular: {
    nativeEvents: ['onFakeNative'],
  },
});

export default function MyComponent(props) {
  const [name, setName] = useState('Steve');

  return (
    <div>
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        onChangeOrSomething={(event) => setName(event.target.value)}
        onFakeNative={(event) => setName(event.target.value)}
        onAnimationEnd={(event) => setName(event.target.value)}
      />
      Hello! I can run in React, Vue, Solid, or Liquid!
    </div>
  );
}
