import { useState, For, onMount } from '@jsx-lite/core';

export interface TabsProps {
  tabs: {
    label: any;
    content: any;
  }[];
  defaultActiveTab?: number;
  collapsible?: boolean;
  tabHeaderLayout?: string;
  activeTabStyle?: any;
}

export default function Tabs(props: TabsProps) {
  const state = useState({
    activeTab: 0,
  });

  onMount(() => {
    if (props.defaultActiveTab) {
      state.activeTab = props.defaultActiveTab;
    }
  });

  return (
    <span
      css={{
        display: 'flex',
        flexDirection: 'row',
        overflow: 'auto',
        overflowScrolling: 'touch',
      }}
      style={{
        justifyContent: props.tabHeaderLayout!,
      }}
      class="builder-tabs-wrap"
    >
      <For each={props.tabs}>{(child) => <div>{child.content}</div>}</For>
    </span>
  );
}
