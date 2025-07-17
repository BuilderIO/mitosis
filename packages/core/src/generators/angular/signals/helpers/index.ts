export const getAngularCoreImportsAsString = ({
  refs,
  output,
  input,
  model,
  onPush,
  effect,
  signal,
  AfterViewInit,
  OnDestroy,
  computed,
  viewChild,
  viewContainerRef,
  templateRef,
  renderer,
}: {
  refs: boolean;
  output: boolean;
  input: boolean;
  model: boolean;
  onPush: boolean;
  AfterViewInit: boolean;
  OnDestroy: boolean;
  effect: boolean;
  signal: boolean;
  computed: boolean;
  viewChild: boolean;
  viewContainerRef: boolean;
  templateRef: boolean;
  renderer?: boolean;
}): string => {
  const angularCoreImports: Record<string, boolean | undefined> = {
    Component: true,
    viewChild: refs || viewChild,
    ElementRef: refs || viewChild,
    ViewContainerRef: viewContainerRef,
    TemplateRef: templateRef,
    Renderer2: renderer,
    model,
    output,
    input,
    effect,
    signal,
    computed,
    ChangeDetectionStrategy: onPush,
    OnDestroy,
    AfterViewInit,
    InputSignal: input,
    ModelSignal: model,
  };
  return Object.entries(angularCoreImports)
    .map(([key, bool]) => (bool ? key : ''))
    .filter((key) => !!key)
    .join(', ');
};
