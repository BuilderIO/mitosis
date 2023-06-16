import { useStore } from '@builder.io/mitosis';

export default function SpecialTags() {
  const state = useStore({
    get scriptStr(): string {
      return `console.log('hello from script tag.')`;
    },
    styleStr: '.wrap { background-color: rgb(255, 0, 0); }',
  });
  return (
    <div>
      <template>
        <div>Template Tag Div</div>
      </template>
      <style innerHTML={state.styleStr} />
      <div className="wrap">red content</div>
      <script innerHTML={state.scriptStr} />
    </div>
  );
}
