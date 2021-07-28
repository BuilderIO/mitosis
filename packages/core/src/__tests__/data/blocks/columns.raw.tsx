import { useState, For } from '@builder.io/mitosis';

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
  const state = useState({
    // TODO: These methods are not used right now, but they will be when
    // support for dynamic CSS lands
    getColumns(): Column[] {
      return props.columns || [];
    },
    getGutterSize(): number {
      return typeof props.space === 'number' ? props.space || 0 : 20;
    },
    getWidth(index: number) {
      const columns = this.getColumns();
      return (columns[index] && columns[index].width) || 100 / columns.length;
    },
    getColumnCssWidth(index: number) {
      const columns = this.getColumns();
      const gutterSize = this.getGutterSize();
      const subtractWidth =
        (gutterSize * (columns.length - 1)) / columns.length;
      return `calc(${this.getWidth(index)}% - ${subtractWidth}px)`;
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
      }}
    >
      <For each={props.columns}>
        {(column) => (
          <div class="builder-column" css={{ flexGrow: '1' }}>
            {column.content}
          </div>
        )}
      </For>
    </div>
  );
}
