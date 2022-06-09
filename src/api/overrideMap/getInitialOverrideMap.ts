import { ImportMap } from '../../shared';
import { getOverrideMap } from './getOverrideMap';

let initialOverrideMap: ImportMap | undefined;

export const getInitialOverrideMap = () =>
  (initialOverrideMap ??= getOverrideMap());
