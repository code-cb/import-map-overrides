import { IMO } from '../utils';

const pendingEvents: string[] = [];

const fireEvent = (type: string) => {
  if (pendingEvents.includes(type)) return;
  pendingEvents.push(type);
  // Set timeout so that event fires after the change has completely finished.
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent<void>(`${IMO}:${type}`));
    pendingEvents.splice(pendingEvents.indexOf(type), 1);
  });
};

export const fireChangeEvent = (): void => fireEvent('change');

export const fireInitEvent = (): void => fireEvent('init');
