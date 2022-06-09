export type ImportMapImports = Record<string, string>;

export type ImportMapScopes = Record<string, ImportMapImports>;

export interface ImportMap {
  imports: ImportMapImports;
  scopes?: ImportMapScopes;
}

export const IMO = 'import-map-override';
const STORAGE_PREFIX = `${IMO}:`;

export const getUrlFromPort = (moduleName: string, port: string): string => {
  const fileName = moduleName.replace(/@/g, '').replace(/\//g, '-');
  return `//localhost:${port}/${fileName}.js`;
};

export const isPort = (url: string): boolean => /^\d+$/.test(url);

export const moduleNameToStorageKey = (moduleName: string) =>
  `${STORAGE_PREFIX}${moduleName}`;

export const storageKeyToModuleName = (key: string) =>
  key.startsWith(STORAGE_PREFIX) ? key.substring(STORAGE_PREFIX.length) : null;
