import { getDisabledOverrides } from './disabledOverrides';
import {
  fetchExternalMap,
  getCurrentPageExternalOverrides,
  getExternalOverrideMap,
} from './externalOverrides';
import {
  createEmptyImportMap,
  ImportMap,
  importMapType,
  localStorageKeyToModuleName,
  mergeImportMap,
  OVERRIDABLE_IMPORTMAP,
  OVERRIDES_ATTR,
  parseImportMap,
  parseJson,
} from './utils';

const QUERY_PARAM_OVERRIDE_NAME = 'imo';
let cachedDefaultMap: ImportMap | undefined;
let initialOverrideMap: ImportMap | undefined;

const isModuleIncluded = (
  moduleName: string,
  disabledOverrides: string[],
  includeDisabled: boolean,
) => includeDisabled || !disabledOverrides.includes(moduleName);

const getLocalStorageOverrides = (
  disabledOverrides: string[],
  includeDisabled = false,
) =>
  Object.fromEntries(
    Object.keys(localStorage).flatMap<[string, string]>(key => {
      const moduleName = localStorageKeyToModuleName(key);
      return moduleName &&
        isModuleIncluded(moduleName, disabledOverrides, includeDisabled)
        ? [[moduleName, localStorage.getItem(key)!]]
        : [];
    }),
  );

const getQueryParamOverrides = (
  disabledOverrides: string[],
  includeDisabled = false,
) => {
  const searchParams = new URL(
    window.location !== window.parent.location
      ? document.referrer
      : document.location.href,
  ).searchParams;
  const queryParam = searchParams.get(QUERY_PARAM_OVERRIDE_NAME);
  if (!queryParam) return {};
  const queryParamImportMap = parseJson<Record<string, string>>(
    queryParam,
    `Invalid importMap query param - text context must be a valid JSON object`,
  );
  return Object.fromEntries(
    Object.keys(queryParamImportMap).flatMap<[string, string]>(moduleName =>
      isModuleIncluded(moduleName, disabledOverrides, includeDisabled)
        ? [[moduleName, queryParamImportMap[moduleName]!]]
        : [],
    ),
  );
};

export const getOverrideMap = (includeDisabled = false): ImportMap => {
  const disabledOverrides = getDisabledOverrides();
  return {
    imports: {
      ...getLocalStorageOverrides(disabledOverrides, includeDisabled),
      ...getQueryParamOverrides(disabledOverrides, includeDisabled),
    },
    scopes: {},
  };
};

export const getInitialOverrideMap = () =>
  (initialOverrideMap ??= getOverrideMap());

export const hasOverrides = (): boolean =>
  Object.keys(getOverrideMap().imports).length > 0;

export const getDefaultMap = async (): Promise<ImportMap> => {
  if (cachedDefaultMap) return cachedDefaultMap;
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
  return (cachedDefaultMap = result);
};

export const getCurrentPageMap = async (): Promise<ImportMap> =>
  Promise.all([
    getDefaultMap(),
    getExternalOverrideMap(getCurrentPageExternalOverrides()),
  ]).then(([defaultMap, externalOverridesMap]) =>
    mergeImportMap(
      mergeImportMap(defaultMap, externalOverridesMap),
      getInitialOverrideMap(),
    ),
  );

export const getNextPageMap = async (): Promise<ImportMap> =>
  Promise.all([getDefaultMap(), getExternalOverrideMap()]).then(
    ([defaultMap, externalOverridesMap]) =>
      mergeImportMap(
        mergeImportMap(defaultMap, externalOverridesMap),
        getOverrideMap(),
      ),
  );
