import * as express from 'express';
import { check } from './service';

export async function expressAuthentication(
  request: express.Request,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  securityName: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  scopes?: string[]
): Promise<{ apiKey: string }> {
  const apiKey = request.header('Authorization')
  await check(apiKey)
  return { apiKey: apiKey as string };
}