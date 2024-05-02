import { PropFunction, component$ } from '@builder.io/qwik';
import {
  Select,
  SelectLabel,
  SelectListbox,
  SelectOption,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from '@qwik-ui/headless';

export default component$(
  (props: {
    value: string;
    options: string[];
    onChange$: PropFunction<(newValue: string) => void>;
  }) => {
    console.log('value', props.value);
    return (
      <Select value={props.value} onChange$={props.onChange$} class="relative">
        <SelectLabel class="block text-sm font-medium text-gray-700">Logged in users</SelectLabel>
        <SelectTrigger class="mt-1 relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-md shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          <SelectValue placeholder="Select an option" class="block truncate" />
          <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              class="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M7 7l3-3 3 3m0 6l-3 3-3-3"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
          </span>
        </SelectTrigger>
        <SelectPopover class="absolute mt-1 w-full rounded-md bg-white shadow-lg z-50">
          <SelectListbox class="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {props.options.map((option) => (
              <SelectOption
                value={option}
                key={option}
                class="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9"
              >
                {option}
                <span class="text-indigo-600 absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M10 3a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H4a1 1 0 110-2h6V4a1 1 0 011-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>
              </SelectOption>
            ))}
          </SelectListbox>
        </SelectPopover>
      </Select>
    );
  },
);
