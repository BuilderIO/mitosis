import { useStyle } from '@builder.io/mitosis';

export default function MyComponent(props) {
  return <button type="button">Button</button>;
}

useStyle(`
  button {
      background: blue;
      color: white;
      font-size: 12px;
      outline: 1px solid black;
  }
`);
