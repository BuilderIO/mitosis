import { configFor } from '@builder.io/e2e-app-spec/shared.config';

export default configFor(
  'yarn workspace @builder.io/e2e-solid run serve --port 7502',
  7502,
);
