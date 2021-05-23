import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { getRepository } from 'typeorm';
import { Alert } from '../../models';
import { setResponse } from '../utils';

export function alertsRoute() {
  const router = new Router<any, any>({ prefix: '/alerts' });

  router.get('/', async (ctx: Router.RouterContext) => {
    const data = await getRepository(Alert).find({ where: { enabled: true } });
    setResponse(ctx, StatusCodes.OK, data);
  });

  return router;
}
