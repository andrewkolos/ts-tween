import { cloneCommonProps } from './clone-common-props';

export function clone<T>(item: T): T {
  return cloneCommonProps(item, item);
}
