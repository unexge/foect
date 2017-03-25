import { Errors } from './type';

export function hasError(errors: Errors): boolean {
  return Object.keys(errors).length > 0;
}
