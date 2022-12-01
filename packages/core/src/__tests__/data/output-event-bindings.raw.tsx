import { useState } from "@builder.io/mitosis";

export default function MyComponent(props) {
  const [name, setName] = useState("Steve");

  return (
      <div>
        <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onSomeEvent={() => console.log()}
        />
        Need to get the output right!
      </div>
  );
}