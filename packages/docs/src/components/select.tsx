import { ClassList, PropFunction, component$, useStylesScoped$ } from '@builder.io/qwik';

export default component$(
  (props: {
    value: string;
    options: string[];
    onChange$: PropFunction<(newValue: string) => void>;
    class?: ClassList;
  }) => {
    useStylesScoped$(`
      select {
        background-image: url("data:image/svg+xml;utf8,${encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 9l6 6l6 -6" /></svg>',
        )}");
        background-repeat: no-repeat;
        background-position-x: 92%;
        background-size: 18px;
        background-position-y: 8px;
      }
    `);

    return (
      <select
        value={props.value}
        onChange$={(_e, el) => props.onChange$(el.value)}
        class={[
          'px-3 capitalize py-1.5 outline-0 pr-8 rounded text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-purple-990 bg-primary focus:ring-primary bg-opacity-10 border border-primary border-opacity-50 transition-colors duration-200 ease-in-out appearance-none',
          props.class,
        ]}
      >
        {props.options.map((option) => (
          <option value={option} key={option} class="capitalize text-black">
            {option}
          </option>
        ))}
      </select>
    );
  },
);
