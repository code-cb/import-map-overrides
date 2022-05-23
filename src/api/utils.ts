import escapeStringRegexp from 'escape-string-regexp';

export const IMO = 'import-map-overrides';
const LOCAL_STORAGE_PREFIX = `${IMO}:`;
export const OVERRIDABLE_IMPORTMAP = 'overridable-importmap';
export const OVERRIDES_ATTR = `data-is-${IMO}` as const;

export const importMapMetaElement = document.querySelector(
  'meta[name="importmap-type"]',
);

export const importMapType =
  importMapMetaElement?.getAttribute('content') || 'importmap';

const canAccessLocalStorage = () => {
  try {
    localStorage.getItem('test');
    return true;
  } catch {
    return false;
  }
};

export interface ImportMap {
  imports: Record<string, string>;
  scopes: Record<string, Record<string, string>>;
}

export const createEmptyImportMap = (): ImportMap => ({
  imports: {},
  scopes: {},
});

export const isImportMapOverridesDisabled = () => {
  if (!canAccessLocalStorage()) return true;

  const domainsMeta = `${IMO}-domains` as const;
  const domainsElement = document.querySelector(`meta[name="${domainsMeta}"]`);
  if (!domainsElement) return false;

  const content = domainsElement.getAttribute('content');
  if (!content) {
    console.warn(`Invalid ${domainsMeta} meta element - content required.`);
    return false;
  }

  const allowListPrefix = 'allowlist:';
  if (content.startsWith(allowListPrefix)) {
    const allowedDomains = content.substring(allowListPrefix.length).split(',');
    return !allowedDomains.some(matchHostname);
  }

  const denyListPrefix = 'denylist:';
  if (content.startsWith(denyListPrefix)) {
    const deniedDomains = content.substring(denyListPrefix.length).split(',');
    return deniedDomains.some(matchHostname);
  }

  console.warn(
    `Invalid ${domainsMeta} meta content attribute - must start with ${allowListPrefix} or ${denyListPrefix}.`,
  );
  return false;
};

export const localStorageKeyToModuleName = (key: string) =>
  key.startsWith(LOCAL_STORAGE_PREFIX)
    ? key.substring(LOCAL_STORAGE_PREFIX.length)
    : null;

export const matchHostname = (domain: string) =>
  new RegExp(escapeStringRegexp(domain).replace('\\*', '.+')).test(
    window.location.hostname,
  );

export const mergeImportMap = (originalMap: ImportMap, newMap: ImportMap) => ({
  imports: {
    ...originalMap.imports,
    ...newMap.imports,
  },
  scopes: {
    ...originalMap.scopes,
    ...newMap.scopes,
  },
});

export const moduleNameToLocalStorageKey = (moduleName: string) =>
  `${LOCAL_STORAGE_PREFIX}${moduleName}`;

export const parseJson = <T>(json: string, errorMessage: string) => {
  try {
    return JSON.parse(json) as T;
  } catch {
    throw new Error(errorMessage);
  }
};

export const parseImportMap = (
  text: string,
  errorMessage = `Expect inline import map to be json, but receive '${text}'`,
) => parseJson<ImportMap>(text, errorMessage);
