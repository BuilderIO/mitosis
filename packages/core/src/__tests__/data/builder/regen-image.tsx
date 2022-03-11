import { useState } from '@builder.io/mitosis';
import { Image } from '@components';

export default function MyComponent(props) {
  const state = useState({ people: ['Steve', 'Sewell'] });

  return (
    <div
      css={{
        padding: '20px',
      }}
    >
      <Image
        image="https://cdn.builder.io/api/v1/image/foobar"
        sizes="100vw"
        backgroundSize="contain"
        css={{
          marignTop: '50px',
          display: 'block',
        }}
      />
    </div>
  );
}
