import { ImportMap } from '../../shared';
import { fireChangeEvent } from '../events';
import {
  createEmptyImportMap,
  mergeImportMap,
  IMOs,
  OVERRIDES_ATTR,
} from '../utils';
import { fetchExternalMap } from './fetchExternalMap';

export { fetchExternalMap, isExternalMapValid } from './fetchExternalMap';

export const EXTERNAL_OVERRIDES_KEY = `${IMOs}-external-maps` as const;

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

export const getCurrentPageExternalOverrides = (): string[] =>
  Array.from(
    document.querySelectorAll<HTMLScriptElement>(
      `script[${OVERRIDES_ATTR}]:not([id="${IMOs}"])`,
    ),
  ).map(script => script.src);
