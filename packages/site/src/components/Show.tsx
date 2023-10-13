import React from 'react';

export type ShowProps = {
  when?: any;
};

/**
 * Declarative show/hide, as opposed to {foo && <Bar />}
 *    <Show when={foo}>
 *      <Bar />
 *    </Show>
 */
export function Show(props: React.PropsWithChildren<ShowProps>) {
  return <>{Boolean(props.when) ? props.children : null}</>;
}
