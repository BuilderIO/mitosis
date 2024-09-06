import { AlpineMetadata } from '@/generators/alpine/types';
import { AngularMetadata } from '@/generators/angular/types';
import { BuilderMetadata } from '@/generators/builder/types';
import { HtmlMetadata } from '@/generators/html/types';
import { LiquidMetadata } from '@/generators/liquid/types';
import { LitMetadata } from '@/generators/lit/types';
import { MarkoMetadata } from '@/generators/marko/types';
import { MitosisMetadata } from '@/generators/mitosis/types';
import { QwikMetadata } from '@/generators/qwik/types';
import { ReactNativeMetadata } from '@/generators/react-native/types';
import { ReactServerComponentsMetadata } from '@/generators/rsc/types';
import { SolidMetadata } from '@/generators/solid/types';
import { StencilMetadata } from '@/generators/stencil/types';
import { SvelteMetadata } from '@/generators/svelte/types';
import { SwiftMetadata } from '@/generators/swift/types';
import { TaroMetadata } from '@/generators/taro/types';
import { TemplateMetadata } from '@/generators/template/types';
import { ReactMetadata, Target, VueMetadata } from '..';

type Targets = typeof import('../targets').targets;
type TargetOptions = {
  [K in Target]?: Partial<NonNullable<Parameters<Targets[K]>[0]>>;
};

export type ComponentMetadata = {
  [index: string]: any;
  httpRequests?: Record<string, string>;
  options?: TargetOptions;
  /** @deprecated Use this for web-components to change the tagName  */
  tagName?: string;
  /** @deprecated Use this for react forwardRef */
  forwardRef?: string;
  /** Enables shadowDom for web-components */
  isAttachedToShadowDom?: boolean;
  alpine?: AlpineMetadata;
  angular?: AngularMetadata;
  builder?: BuilderMetadata;
  html?: HtmlMetadata;
  lit?: LitMetadata;
  liquid?: LiquidMetadata;
  marko?: MarkoMetadata;
  mitosis?: MitosisMetadata;
  qwik?: QwikMetadata;
  react?: ReactMetadata;
  reactNative?: ReactNativeMetadata;
  rsc?: ReactServerComponentsMetadata;
  solid?: SolidMetadata;
  stencil?: StencilMetadata;
  svelte?: SvelteMetadata;
  swift?: SwiftMetadata;
  taro?: TaroMetadata;
  template?: TemplateMetadata;
  vue?: VueMetadata;
};
