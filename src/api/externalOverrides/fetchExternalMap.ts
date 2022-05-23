import { createEmptyImportMap, ImportMap } from '../utils';

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

const externalOverrideMapPromises: Record<
  string,
  Promise<FetchImportMapResult>
> = {};

const invalidExternalMaps: string[] = [];

export const fetchExternalMap = async (url: string) => {
  const result = await (externalOverrideMapPromises[url] ??=
    fetchImportMap(url));

  if (result.kind === 'success') return result.importMap;

  invalidExternalMaps.push(result.url);
  return createEmptyImportMap();
};

export const isExternalMapValid = async (
  importMapUrl: string,
): Promise<boolean> => {
  await fetchExternalMap(importMapUrl);
  return !invalidExternalMaps.includes(importMapUrl);
};
