import { useState } from 'react';

export default function MyBasicComponent() {
  const [setName, name] = useState('Steve');

  const className = name == 'Steve' ? 'text-red' : 'text-black';

  return (
    <div className="container">
      <input
        value={name}
        autoCapitalize
        onChange={(event) => setName(event.target.value)}
      />

      <input type="checkbox" name="scales" defaultChecked disabled />

      <span className={className}>
        Hello! I can run in React, Vue, Solid, or Liquid!
      </span>
      <svg
        width={120}
        height={120}
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon points="60,30 90,90 30,90">
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 60 70"
            to="360 60 70"
            dur="10s"
            repeatCount="indefinite"
          />
        </polygon>
      </svg>
    </div>
  );
}
