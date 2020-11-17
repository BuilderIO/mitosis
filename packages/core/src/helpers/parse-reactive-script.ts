export type ParseReactiveScriptOptions = {
  format?: 'html' | 'js';
};

export function parseReactiveScript(
  code: string,
  options: ParseReactiveScriptOptions = {},
) {
  const format = options.format || 'js';
  const useCode =
    format === 'html'
      ? code.replace(`<script\s[^>]*reactive[^>]*>([\s\S]_)</\s*script>`, '$1')
      : code;
}
