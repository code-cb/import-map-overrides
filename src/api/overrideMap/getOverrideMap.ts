import { getDisabledOverrides } from '../disabledOverride';
import { ImportMap, localStorageKeyToModuleName, parseJson } from '../utils';

const QUERY_PARAM_OVERRIDE_NAME = 'imo';

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
