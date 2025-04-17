export const getAngularCoreImportsAsString = ({
  refs,
  output,
  input,
  model,
  onPush,
  effect,
  signal,
  computed,
}: {
  refs: boolean;
  output: boolean;
  input: boolean;
  model: boolean;
  onPush: boolean;
  effect: boolean;
  signal: boolean;
  computed: boolean;
}): string => {
  const angularCoreImports: Record<string, boolean> = {
    Component: true,
    viewChild: refs,
    ElementRef: refs,
    model,
    output,
    input,
    effect,
    signal,
    computed,
    ChangeDetectionStrategy: onPush,
  };
  return Object.entries(angularCoreImports)
    .map(([key, bool]) => (bool ? key : ''))
    .filter((key) => !!key)
    .join(', ');
};
