import { addCodeNgAfterViewInit } from '@/generators/angular/helpers/hooks';
import { ToAngularOptions } from '@/generators/angular/types';
import { dashCase } from '@/helpers/dash-case';
import { getRefs } from '@/helpers/get-refs';
import { mapRefs } from '@/helpers/map-refs';
import { MitosisComponent } from '@/types/mitosis-component';
import { isAssignmentExpression } from '@babel/types';

export const getDomRefs = ({
  json,
  options,
  withAttributePassing,
  rootRef,
}: {
  json: MitosisComponent;
  options: ToAngularOptions;
  withAttributePassing?: boolean;
  rootRef: string;
}): Set<string> => {
  const domRefs = getRefs(json);

  const nativeElement = options.api === 'signals' ? `()?.nativeElement` : '?.nativeElement';

  if (withAttributePassing) {
    if (!domRefs.has(rootRef)) {
      domRefs.add(rootRef);
    }

    addCodeNgAfterViewInit(
      json,
      `
            const element: HTMLElement | null = this.${rootRef}${nativeElement};
            this.enableAttributePassing(element, "${dashCase(json.name)}");
            `,
    );
  }

  mapRefs(json, (refName, extra) => {
    const isDomRef = domRefs.has(refName);
    let additional = nativeElement;
    if (extra?.type === 'deps-array' && options.api === 'signals') {
      // we don't need nativeElement for deps-array in hooks
      additional = '()';
    } else if (extra?.path.parentPath && isAssignmentExpression(extra?.path.parentPath.container)) {
      // we cannot use conditionals for assignments, it has to be checked before
      additional = options.api === 'signals' ? `()!.nativeElement` : '!.nativeElement';
    }
    return `this.${isDomRef ? '' : '_'}${refName}${isDomRef ? additional : ''}`;
  });

  return domRefs;
};
