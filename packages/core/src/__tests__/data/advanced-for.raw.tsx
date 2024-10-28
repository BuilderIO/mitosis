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
      {state.names?.map((person, index) => {
        console.log(person);
        return (
          <span>
            {person} {index}
          </span>
        );
      })}
      {Array.from({ length: 10 }, (person, count) => {
        console.log(person);
        return (
          <span>
            {person} {count}
          </span>
        );
      })}

      {state.names?.map(function (person, i) {
        console.log(person);
        return (
          <span>
            {person} {i}
          </span>
        );
      })}
      {Array.from({ length: 10 }, function (person, index) {
        console.log(person);
        return (
          <span>
            {person} {index}
          </span>
        );
      })}
    </main>
  );
}
