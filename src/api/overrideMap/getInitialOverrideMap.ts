import { ImportMap } from '../utils';
import { getOverrideMap } from './getOverrideMap';

let initialOverrideMap: ImportMap | undefined;

export const getInitialOverrideMap = () =>
  (initialOverrideMap ??= getOverrideMap());
