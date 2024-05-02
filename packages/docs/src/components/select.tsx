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
          'px-3 py-2 text-white bg-neutral-800 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-white',
          props.class,
        ]}
      >
        {props.options.map((option) => (
          <option value={option} key={option} class="text-neutral-300">
            {option}
          </option>
        ))}
      </select>
    );
  },
);
