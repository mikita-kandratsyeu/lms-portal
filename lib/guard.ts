export const isString = (value: unknown): value is string => typeof value === 'string';

export const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && isFinite(value);

export const isObject = (value: unknown): value is object => typeof value === 'object';

export const isArray = <T>(value: unknown): value is Array<T> => Array.isArray(value);
