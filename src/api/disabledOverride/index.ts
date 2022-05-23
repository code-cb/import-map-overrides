import { fireChangeEvent } from '../events';
import { IMO } from '../utils';

export const DISABLED_OVERRIDES_KEY = `${IMO}-disabled` as const;

export const getDisabledOverrides = (): string[] => {
  const disabledOverrides = localStorage.getItem(DISABLED_OVERRIDES_KEY);
  return disabledOverrides ? JSON.parse(disabledOverrides) : [];
};

export const disableOverride = (moduleName: string): boolean => {
  const disabledOverrides = getDisabledOverrides();
  if (disabledOverrides.includes(moduleName)) return false;
  localStorage.setItem(
    DISABLED_OVERRIDES_KEY,
    JSON.stringify([...disabledOverrides, moduleName]),
  );
  fireChangeEvent();
  return true;
};

export const enableOverride = (moduleName: string): boolean => {
  const disabledOverrides = getDisabledOverrides();
  if (!disabledOverrides.includes(moduleName)) return false;
  localStorage.setItem(
    DISABLED_OVERRIDES_KEY,
    JSON.stringify(
      disabledOverrides.filter(override => override !== moduleName),
    ),
  );
  fireChangeEvent();
  return true;
};

export const isDisabled = (moduleName: string): boolean =>
  getDisabledOverrides().includes(moduleName);
