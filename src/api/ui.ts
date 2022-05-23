import { IMO } from './utils';

const CUSTOM_ELEMENT_NAME = `${IMO}-full`;
const SHOW_WHEN_LOCAL_STORAGE = `show-when-local-storage`;

const createCustomElement = () => {
  const customElement = document.createElement(CUSTOM_ELEMENT_NAME);
  customElement.setAttribute(SHOW_WHEN_LOCAL_STORAGE, 'true');
  document.body.appendChild(customElement);
  return customElement;
};

export const enableUi = (): void => {
  const customElement =
    document.querySelector(CUSTOM_ELEMENT_NAME) ?? createCustomElement();
  const localStorageKey = customElement.getAttribute(SHOW_WHEN_LOCAL_STORAGE);
  if (localStorageKey) {
    localStorage.setItem(localStorageKey, 'true');
    // TODO: where is renderWithPreact from???
    customElement.renderWithPreact();
  }
};
