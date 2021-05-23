import { AxiosRequestConfig } from 'axios';
import { NextPageContext, GetServerSidePropsContext } from 'next';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

export function getServerAxiosProps(ctx?: NextPageContext | GetServerSidePropsContext): Partial<AxiosRequestConfig> {

  return {
    baseURL: serverRuntimeConfig.rsHost || '',
    headers: ctx?.req?.headers?.cookie
      ? {
          cookie: ctx.req.headers.cookie,
        }
      : undefined,
  };
}
