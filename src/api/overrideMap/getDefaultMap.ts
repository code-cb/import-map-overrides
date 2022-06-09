import { ImportMap } from '../../shared';
import { fetchExternalMap } from '../externalOverrides';
import {
  createEmptyImportMap,
  importMapType,
  mergeImportMap,
  OVERRIDABLE_IMPORTMAP,
  OVERRIDES_ATTR,
  parseImportMap,
} from '../utils';

const mergeDefaultMaps = async () => {
  let result = createEmptyImportMap();
  await Promise.all(
    Array.from(
      document.querySelectorAll<HTMLScriptElement>(
        `script[type="${importMapType}"], script[type="${OVERRIDABLE_IMPORTMAP}"]`,
      ),
    ).map(async script => {
      if (script.hasAttribute(OVERRIDES_ATTR)) return;
      const importMap = script.src
        ? await fetchExternalMap(script.src)
        : parseImportMap(script.textContent!);
      result = mergeImportMap(result, importMap);
    }),
  );
  return result;
};

let defaultMapPromise: Promise<ImportMap> | undefined;

export const getDefaultMap = async (): Promise<ImportMap> =>
  (defaultMapPromise ??= mergeDefaultMaps());
