export const getAngularCoreImportsAsString = ({
  refs,
  output,
  input,
  model,
  onPush,
  effect,
  signal,
  computed,
  viewChild,
  viewContainerRef,
  templateRef,
}: {
  refs: boolean;
  output: boolean;
  input: boolean;
  model: boolean;
  onPush: boolean;
  effect: boolean;
  signal: boolean;
  computed: boolean;
  viewChild: boolean;
  viewContainerRef: boolean;
  templateRef: boolean;
}): string => {
  const angularCoreImports: Record<string, boolean> = {
    Component: true,
    viewChild: refs || viewChild,
    ElementRef: refs,
    ViewContainerRef: viewContainerRef,
    TemplateRef: templateRef,
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
