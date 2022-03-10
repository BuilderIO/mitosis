import { join } from 'path';

export default function () {
  // Make sure components is enabled
  if (!this.nuxt.options.components) {
    throw new Error(
      'Please set `components: true` inside `nuxt.config` and ensure using `nuxt >= 2.13.0`'
    );
  }

  this.nuxt.hook('components:dirs', (dirs) => {
    // Add ./components dir to the list
    dirs.push({
      path: join(__dirname, 'nuxt2/src/components'),
      prefix: 'myMitosisProject',
    });
  });
}
