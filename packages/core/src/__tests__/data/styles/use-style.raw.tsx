import { useStyle } from '@builder.io/mitosis';

export default function MyComponent(props) {
  useStyle(`
        button {
            background: blue;
            color: white;
            font-size: 12px;
            outline: 1px solid black;
        }
    `);

  return <button type="button">Button</button>;
}
