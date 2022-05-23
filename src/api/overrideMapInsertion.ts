import { getExternalOverrides } from './externalOverrides';
import { getInitialOverrideMap } from './overrideMap';
import {
  ImportMap,
  mergeImportMap,
  IMO,
  OVERRIDES_ATTR,
  OVERRIDABLE_IMPORTMAP,
  importMapType,
  parseImportMap,
} from './utils';

const getLastImportMapScript = () => {
  const scripts = document.querySelectorAll<HTMLScriptElement>(
    `script[type="${importMapType}"]`,
  );
  return scripts[scripts.length - 1];
};

const insertOverrideMap = (
  map: string | ImportMap,
  id: string,
  referenceNode?: HTMLScriptElement,
) => {
  const overrideMapElement = document.createElement('script');
  overrideMapElement.type = importMapType;
  overrideMapElement.id = id;
  overrideMapElement.setAttribute(OVERRIDES_ATTR, '');
  typeof map === 'string'
    ? (overrideMapElement.src = map)
    : (overrideMapElement.textContent = JSON.stringify(map, null, 2));
  referenceNode
    ? referenceNode.insertAdjacentElement('afterend', overrideMapElement)
    : document.head.appendChild(overrideMapElement);
  return overrideMapElement;
};

const insertExternalOverrideMaps = (
  referenceNode: HTMLScriptElement | undefined,
) => {
  let refNode = referenceNode;
  const externalOverrides = getExternalOverrides();
  externalOverrides.forEach((mapUrl, index) => {
    refNode = insertOverrideMap(mapUrl, `${IMO}-external-${index}`, refNode);
  });
  return refNode;
};

export const insertOverrideMaps = () => {
  const overridableImportMap = document.querySelector<HTMLScriptElement>(
    `script[type="${OVERRIDABLE_IMPORTMAP}"]`,
  );
  let referenceNode = overridableImportMap ?? getLastImportMapScript();

  if (overridableImportMap) {
    if (overridableImportMap.src)
      throw new Error(
        `import-map-overrides: external import maps with type="${OVERRIDABLE_IMPORTMAP}" are not supported`,
      );

    const originalMap = parseImportMap(
      overridableImportMap.textContent ?? '',
      `Invalid <script type="${OVERRIDABLE_IMPORTMAP}"> - text content must be json`,
    );

    const initialOverrideMap = getInitialOverrideMap();
    referenceNode = insertOverrideMap(
      mergeImportMap(originalMap, initialOverrideMap),
      IMO,
      referenceNode,
    );
    referenceNode = insertExternalOverrideMaps(referenceNode);
  } else {
    referenceNode = insertExternalOverrideMaps(referenceNode);
    const initialOverrideMap = getInitialOverrideMap();
    if (Object.keys(initialOverrideMap.imports).length > 0) {
      referenceNode = insertOverrideMap(initialOverrideMap, IMO, referenceNode);
    }
  }
};
