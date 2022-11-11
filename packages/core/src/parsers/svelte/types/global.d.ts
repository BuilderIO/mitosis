import { MitosisComponent } from '../../../types/mitosis-component';

export {};

declare global {
  type SveltosisComponent = MitosisComponent & { props: any };
}
