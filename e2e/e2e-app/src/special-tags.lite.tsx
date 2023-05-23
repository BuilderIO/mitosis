import { useStore } from '@builder.io/mitosis';

export default function specialTags() {
  const state = useStore({
    get scriptStr(): string {
      return `console.log('hello from script tag.')`;
    },
  });
  return (
    <div>
      <template>
        <div>Template Tag Div</div>
      </template>
      <style innerHTML=".wrap { background-color: red; }" />
      <div className="wrap">red content</div>
      <script innerHTML={state.scriptStr} />
    </div>
  );
}
