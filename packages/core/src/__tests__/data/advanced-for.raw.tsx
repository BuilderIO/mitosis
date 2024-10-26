import { useStore } from '@builder.io/mitosis';

export default function MyBasicForShowComponent() {
  const state = useStore({
    name: 'PatrickJS',
    names: ['Steve', 'PatrickJS'],
  });

  return (
    <main>
      {state.names.map((person, i) => (
        <div>
          {i}: {person}
        </div>
      ))}
      {state.names?.map((person) => (
        <span>{person}</span>
      ))}
      {state.names?.map(() => (
        <br />
      ))}
      {Array.from({ length: 10 }).map((_, ee) => (
        <pre>{ee}</pre>
      ))}
      {Array.from({ length: 10 }, () => (
        <p>{index}</p>
      ))}
    </main>
  );
}
