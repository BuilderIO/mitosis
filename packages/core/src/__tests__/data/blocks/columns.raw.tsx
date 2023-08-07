import { For, useStore } from '@builder.io/mitosis';

type Column = {
  content: any;
  // TODO: Implement this when support for dynamic CSS lands
  width?: number;
};

export interface ColumnProps {
  columns?: Column[];

  // TODO: Implement this when support for dynamic CSS lands
  space?: number;
  // TODO: Implement this when support for dynamic CSS lands
  stackColumnsAt?: 'tablet' | 'mobile' | 'never';
  // TODO: Implement this when support for dynamic CSS lands
  reverseColumnsWhenStacked?: boolean;
}

export default function Column(props: ColumnProps) {
  const state = useStore({
    getColumns(): Column[] {
      return props.columns || [];
    },
    getGutterSize(): number {
      return typeof props.space === 'number' ? props.space || 0 : 20;
    },
    getWidth(index: number) {
      const columns = state.getColumns();
      return (columns[index] && columns[index].width) || 100 / columns.length;
    },
    getColumnCssWidth(index: number) {
      const columns = state.getColumns();
      const gutterSize = state.getGutterSize();
      const subtractWidth = (gutterSize * (columns.length - 1)) / columns.length;
      return `calc(${state.getWidth(index)}% - ${subtractWidth}px)`;
    },
  });

  return (
    <div
      class="builder-columns"
      css={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        lineHeight: 'normal',
        '@media (max-width: 999px)': {
          flexDirection: 'row',
        },
        '@media (max-width: 639px)': {
          flexDirection: 'row-reverse',
        },
      }}
    >
      <For each={props.columns}>
        {(column, index) => (
          <div class="builder-column" css={{ flexGrow: '1' }}>
            {column.content} {index}
          </div>
        )}
      </For>
    </div>
  );
}
