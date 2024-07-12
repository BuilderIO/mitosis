import { ToReactOptions, ToVueOptions } from '@builder.io/mitosis';
import { $, Signal, component$, useSignal } from '@builder.io/qwik';
import { OutputFramework } from '~/services/compile';
import Select from './select';

type Option<O> = {name: keyof O} & ({
  type: 'boolean';
  default: boolean
} | {
  type: 'enum';
  enum: Array<string>;
  default: string;
});

const DEFAULT_OPTIONS: Option<ToVueOptions>[] = [{
  name: 'typescript', 
  type: 'boolean',
  default: true
}]

type Dictionary<T> = {
  [index: string]: T
}
type Options = Dictionary<string | boolean>

export const getDefaultOptions = (target: OutputFramework) => {
  const opts = getOptions(target)
  const opt: Options = {}

  for (const o of opts) {
    opt[o.name] = o.default
  }

  return opt
}


const _getOptions = (target:OutputFramework) => {
  switch (target) {
    case 'vue':{
      const o: Array<Option<ToVueOptions>> = [{
        name: 'casing',
        type: 'enum',
        enum: ['pascal', 'kebab'],
        default: 'pascal'
      },
    {
      name: 'api',
      type: 'enum',
      enum: ['options', 'composition'],
      default: 'composition'
    }]

      return o}
      
    case 'react': {

    const o: Array<Option<ToReactOptions>> = [{
      name: 'stylesType',
      type: 'enum',
      enum: [
        'emotion', 'styled-components', 'styled-jsx', 'react-native', 'style-tag'
      ],
      default: 'style-tag'
    }]
 return o }
    default:
      return []
  }
}
const getOptions = (target:OutputFramework) => {
  return [
    ...DEFAULT_OPTIONS,
    ..._getOptions(target)
  ]
}

export default component$(
  ({options, target}: {    options: Options, target:Signal<OutputFramework> }) => {
    const showModal = useSignal(false);


    return (
      <div>
      <button onClick$={$(() => {
        showModal.value = !showModal.value
      })} class={'px-3 py-1.5 outline-0 rounded text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-purple-990 bg-primary focus:ring-primary bg-opacity-10 border border-primary border-opacity-50 transition-colors duration-200 ease-in-out appearance-none'}>options</button>

      {showModal.value && <div class={"absolute top-40 bottom-40 left-40 right-40 bg-purple-990 z-50 p-10 max-w-2xl"}>
      <h1>{target.value} settings.</h1>

<div class="w-full flex flex-col gap-4 pt-4">
      {getOptions(target.value).map(option => {
        console.log('consuming option: ', {option, options});
        
        return <div class="flex gap-2 items-baseline justify-between">
          <div>{option.name}</div>
          <div>{option.type === 'boolean' ? <form><input type="checkbox" checked={options[option.name] as boolean} onChange$={$(() => {
            console.log('before: ', options.value);
            
            options[option.name] = !options[option.name]

            console.log('after: ', options.value);
          })} ></input></form> : <Select onChange$={$((newVal) => {
            options[option.name] = newVal
          })} value={options[option.name] as string} options={option.enum} class="" />}</div>
        </div>
      })}
      </div></div>}
      </div>
    );
  },
);
