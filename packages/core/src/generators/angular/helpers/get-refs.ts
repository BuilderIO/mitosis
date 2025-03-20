import { addCodeNgAfterViewInit } from '@/generators/angular/helpers/hooks';
import { ToAngularOptions } from '@/generators/angular/types';
import { dashCase } from '@/helpers/dash-case';
import { getRefs } from '@/helpers/get-refs';
import { mapRefs } from '@/helpers/map-refs';
import {
  getAddAttributePassingRef,
  shouldAddAttributePassing,
} from '@/helpers/web-components/attribute-passing';
import { MitosisComponent } from '@/types/mitosis-component';

export const getDomRefs = ({
  json,
  options,
}: {
  json: MitosisComponent;
  options: ToAngularOptions;
}): Set<string> => {
  const domRefs = getRefs(json);
  const withAttributePassing = shouldAddAttributePassing(json, options);
  const rootRef = getAddAttributePassingRef(json, options);

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

  mapRefs(json, (refName) => {
    const isDomRef = domRefs.has(refName);
    return `this.${isDomRef ? '' : '_'}${refName}${isDomRef ? nativeElement : ''}`;
  });

  return domRefs;
};
