import {
  addOverride,
  getUrlFromPort,
  init,
  removeOverride,
  resetOverrides,
} from './overrideHandling';
import { getOverrideMap, hasOverrides } from './overrideMap';
import { enableUi } from './ui';
import { isImportMapOverridesDisabled } from './utils';

const getApi = () =>
  ({
    addOverride,
    enableUi,
    getOverrideMap,
    getUrlFromPort,
    hasOverrides,
    removeOverride,
    resetOverrides,
  } as const);

const isDisabled = isImportMapOverridesDisabled();

export const importMapOverrides = isDisabled
  ? ({ isDisabled } as const)
  : ({ api: getApi(), isDisabled } as const);

if (!isDisabled) init();
