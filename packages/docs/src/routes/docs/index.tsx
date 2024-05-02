import { RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ redirect }) => {
  throw redirect(302, '/docs/overview');
};
