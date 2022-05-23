import { fireChangeEvent } from './events';
import {
  createEmptyImportMap,
  ImportMap,
  mergeImportMap,
  IMO,
  OVERRIDES_ATTR,
} from './utils';

export const EXTERNAL_OVERRIDES_KEY = `${IMO}-external-maps` as const;

const importMapCache: Record<string, ImportMap> = {};

const invalidExternalMaps: string[] = [];

type FetchImportMapResult =
  | {
      kind: 'success';
      importMap: ImportMap;
    }
  | {
      kind: 'error';
      url: string;
    };

const fetchImportMap = async (url: string): Promise<FetchImportMapResult> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(
        new Error(
          `Unable to download external override import map from url ${response.url}. Server responded with status ${response.status}`,
        ),
      );
      return {
        kind: 'error',
        url: response.url,
      };
    }

    try {
      return {
        kind: 'success',
        importMap: await response.json(),
      };
    } catch (err) {
      console.warn(
        new Error(
          `External override import map contained invalid json, at url ${response.url}. ${err}`,
        ),
      );
      return {
        kind: 'error',
        url: response.url,
      };
    }
  } catch (err) {
    console.warn(
      new Error(`Unable to download external import map at url ${url}`),
    );
    return {
      kind: 'error',
      url: new URL(url, document.baseURI).href,
    };
  }
};

export const fetchExternalMap = async (url: string) => {
  const importMapFromCache = importMapCache[url];
  if (importMapFromCache) return importMapFromCache;

  const fetchResult = await fetchImportMap(url);
  if (fetchResult.kind === 'success') {
    importMapCache[url] = fetchResult.importMap;
    return fetchResult.importMap;
  }

  invalidExternalMaps.push(fetchResult.url);
  return createEmptyImportMap();
};

export const getExternalOverrides = (): string[] => {
  const externalOverrides = localStorage.getItem(EXTERNAL_OVERRIDES_KEY);
  return externalOverrides ? JSON.parse(externalOverrides).sort() : [];
};

export const addExternalOverride = (url: string): boolean => {
  const fullUrl = new URL(url, document.baseURI).href;
  const externalOverrides = getExternalOverrides();
  if (externalOverrides.includes(fullUrl)) return false;
  localStorage.setItem(
    EXTERNAL_OVERRIDES_KEY,
    JSON.stringify([...externalOverrides, fullUrl]),
  );
  fireChangeEvent();
  return true;
};

export const removeExternalOverride = (url: string): boolean => {
  const externalOverrides = getExternalOverrides();
  if (!externalOverrides.includes(url)) return false;
  localStorage.setItem(
    EXTERNAL_OVERRIDES_KEY,
    JSON.stringify(externalOverrides.filter(override => override !== url)),
  );
  fireChangeEvent();
  return true;
};

export const getExternalOverrideMap = async (
  externalOverrides = getExternalOverrides(),
): Promise<ImportMap> => {
  let result = createEmptyImportMap();
  await Promise.all(
    externalOverrides.map(async url => {
      const importMap = await fetchExternalMap(url);
      result = mergeImportMap(result, importMap);
    }),
  );
  return result;
};

export const isExternalMapValid = async (
  importMapUrl: string,
): Promise<boolean> => {
  await fetchExternalMap(importMapUrl);
  return !invalidExternalMaps.includes(importMapUrl);
};

export const getCurrentPageExternalOverrides = (): string[] =>
  Array.from(
    document.querySelectorAll<HTMLScriptElement>(
      `script[${OVERRIDES_ATTR}]:not([id="${IMO}"])`,
    ),
  ).map(script => script.src);
