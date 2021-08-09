// TODO: get the exports alias working here so this is just `import '@jsx-lite/core/jsx'
import '@jsx-lite/core/dist/src/jsx-types'
import { useState, Show } from '@jsx-lite/core'

type MyProps = {
  showInput?: boolean
}

export default function MyComponent(props: MyProps) {
  const state = useState({
    name: 'Steve'
  })

  return (
    <div>
      <Show when={props.showInput}>
        <input
          css={{ color: 'red' }}
          value={state.name}
          onChange={event => (state.name = event.target.value)}
        />
      </Show>
      Hello! I can run in React, Vue, Solid, or Liquid!
    </div>
  )
}
