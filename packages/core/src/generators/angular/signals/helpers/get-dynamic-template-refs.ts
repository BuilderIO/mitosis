const getViewContainerRefName = (component: string) => {
  return component.split('.')[1].toLowerCase() + 'TemplateRef';
};

const getNgTemplateRefName = (component: string) => {
  return component.split('.')[1].toLowerCase() + 'Template';
};

export const getDynamicTemplateRefs = (dynamicComponents: Set<string>) => {
  return `
  myContent = signal<any[]>([]);
  ${Array.from(dynamicComponents)
    .map(
      (component) =>
        `${getViewContainerRefName(
          component,
        )} = viewChild<TemplateRef<any>>('${getNgTemplateRefName(component)}');`,
    )
    .join('\n')}
  `;
};

export const getInitEmbedViewCode = (dynamicComponents: Set<string>) => {
  return `
  this.myContent.set([${Array.from(dynamicComponents)
    .map(
      (component) =>
        `this.viewContainer.createEmbeddedView(this.${getViewContainerRefName(
          component,
        )}()).rootNodes`,
    )
    .join(', ')}]);`;
};
