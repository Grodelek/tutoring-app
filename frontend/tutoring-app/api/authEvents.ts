let _handler: (() => void) | null = null;

export const registerUnauthorizedHandler = (fn: () => void) => {
  _handler = fn;
};

export const triggerUnauthorized = () => {
  _handler?.();
};
