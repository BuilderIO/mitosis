import { componentToAngularClassic } from '@/generators/angular/classic/component';
import { componentToAngularSignals } from '@/generators/angular/signals/component';
import { DEFAULT_ANGULAR_OPTIONS, ToAngularOptions } from '@/generators/angular/types';
import { initializeOptions } from '@/helpers/merge-options';
import { TranspilerGenerator } from '@/types/transpiler';

export const componentToAngular: TranspilerGenerator<ToAngularOptions> = (userOptions = {}) => {
  return (args) => {
    const options = initializeOptions({
      target: 'angular',
      component: args.component,
      defaults: DEFAULT_ANGULAR_OPTIONS,
      userOptions,
    });

    if (options.api === 'signals') {
      /*
       * Some features aren't available to reduce complexity:
       * - Spread props
       * - Dynamic components
       * - Context
       */
      return componentToAngularSignals(userOptions)(args);
    }

    return componentToAngularClassic(userOptions)(args);
  };
};
