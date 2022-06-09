import cookie from 'cookie';
import { IncomingMessage } from 'node:http';
import { TLSSocket } from 'node:tls';
import {
  getUrlFromPort as defaultGetUrlFromPort,
  ImportMap,
  ImportMapImports,
  isPort,
  storageKeyToModuleName,
} from '../shared';

export type { ImportMap, ImportMapImports, ImportMapScopes } from '../shared';

export const applyOverrides = (
  { imports, scopes }: ImportMap,
  overrides: ImportMapImports,
): ImportMap => ({
  imports: { ...imports, ...overrides },
  scopes: scopes || {},
});

const getProtocol = (req: IncomingMessage) =>
  (req.headers['x-forwarded-proto'] as string)?.split(/\s*,\s*/)[0] ||
  ((req.socket as TLSSocket).encrypted ? 'https' : 'http');

type GetUrlFromPort = (
  port: string,
  moduleName: string,
  req: IncomingMessage,
) => string;

export const getOverridesFromCookies = (
  req: IncomingMessage,
  getUrlFromPort: GetUrlFromPort = defaultGetUrlFromPort,
): ImportMapImports => {
  const parsedCookie = cookie.parse(req.headers.cookie || '');
  return Object.fromEntries(
    Object.keys(parsedCookie).flatMap<[string, string]>(cookieName => {
      const moduleName = storageKeyToModuleName(cookieName);
      if (!moduleName) return [];
      let url = parsedCookie[cookieName]!;
      isPort(url) && (url = getUrlFromPort(url, moduleName, req));
      url.startsWith('//') && (url = `${getProtocol(req)}:${url}`);
      return [[moduleName, url]];
    }),
  );
};
