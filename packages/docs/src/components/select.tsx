import { ClassList, PropFunction, component$ } from '@builder.io/qwik';

export default component$(
  (props: {
    value: string;
    options: string[];
    onChange$: PropFunction<(newValue: string) => void>;
    class?: ClassList;
  }) => {
    return (
      <select
        value={props.value}
        onChange$={(_e, el) => props.onChange$(el.value)}
        class={[
          'px-3 py-1.5 text-white bg-purple-990 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-purple-990 focus:ring-white',
          props.class,
        ]}
      >
        {props.options.map((option) => (
          <option value={option} key={option} class="text-purple-300">
            {option}
          </option>
        ))}
      </select>
    );
  },
);
