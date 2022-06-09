import {
  getUrlFromPort,
  ImportMap,
  isPort,
  moduleNameToStorageKey,
} from '../../shared';
import { insertOverrideMaps } from '../overrideMapInsertion';
import { fireChangeEvent, fireInitEvent } from '../events';
import { importMapMetaElement } from '../utils';
import { getOverrideMap } from '../overrideMap';
import { DISABLED_OVERRIDES_KEY, enableOverride } from '../disabledOverride';
import { EXTERNAL_OVERRIDES_KEY } from '../externalOverrides';

const serverOverrides = !!importMapMetaElement?.hasAttribute('server-cookie');

export const addOverride = (moduleName: string, url: string): ImportMap => {
  const fullUrl = isPort(url) ? getUrlFromPort(moduleName, url) : url;
  const key = moduleNameToStorageKey(moduleName);
  localStorage.setItem(key, fullUrl);
  if (serverOverrides) document.cookie = `${key}=${fullUrl}`;
  fireChangeEvent();
  return getOverrideMap();
};

export const removeOverride = (moduleName: string): boolean => {
  const key = moduleNameToStorageKey(moduleName);
  // TODO: should we return here???
  if (!localStorage.getItem(key)) return false;
  localStorage.removeItem(key);
  if (serverOverrides)
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  enableOverride(moduleName);
  fireChangeEvent();
  return true;
};

export const resetOverrides = (): ImportMap => {
  Object.keys(getOverrideMap().imports).forEach(moduleName =>
    removeOverride(moduleName),
  );
  localStorage.removeItem(DISABLED_OVERRIDES_KEY);
  localStorage.removeItem(EXTERNAL_OVERRIDES_KEY);
  fireChangeEvent();
  return getOverrideMap();
};

export const init = (): void => {
  const serverOnly = !!importMapMetaElement?.hasAttribute('server-only');
  if (!serverOnly) insertOverrideMaps();
  fireInitEvent();
};
