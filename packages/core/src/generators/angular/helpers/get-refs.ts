import { addCodeNgAfterViewInit } from '@/generators/angular/helpers/hooks';
import { ToAngularOptions } from '@/generators/angular/types';
import { dashCase } from '@/helpers/dash-case';
import { getRefs } from '@/helpers/get-refs';
import { mapRefs } from '@/helpers/map-refs';
import { MitosisComponent } from '@/types/mitosis-component';

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

  mapRefs(json, (refName, type) => {
    const isDomRef = domRefs.has(refName);
    // we don't need nativeElement for deps-array in hooks
    const extra = type === 'deps-array' ? '()' : nativeElement;
    return `this.${isDomRef ? '' : '_'}${refName}${isDomRef ? extra : ''}`;
  });

  return domRefs;
};
