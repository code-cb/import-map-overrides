import { ImportMap } from '../../shared';
import {
  getCurrentPageExternalOverrides,
  getExternalOverrideMap,
} from '../externalOverrides';
import { mergeImportMap } from '../utils';
import { getDefaultMap } from './getDefaultMap';
import { getInitialOverrideMap } from './getInitialOverrideMap';
import { getOverrideMap } from './getOverrideMap';

export { getDefaultMap } from './getDefaultMap';
export { getInitialOverrideMap } from './getInitialOverrideMap';
export { getOverrideMap } from './getOverrideMap';

export const hasOverrides = (): boolean =>
  Object.keys(getOverrideMap().imports).length > 0;

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
