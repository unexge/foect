import Control from './control';
import { Validator } from './type';

const validators = new Map<string, Validator>();

const EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
const isEmpty = (val: any) => null === val || undefined === val;

validators.set('required', (val: any) => {
  if (isEmpty(val)) {
    return { required: true };
  }

  if ('string' === typeof val && '' === val.trim()) {
    return { required: true };
  }

  return null;
});

validators.set('minLength', (val: any, length: number) => {
  if (isEmpty(val)) {
    return null;
  }

  return `${val}`.length >= length ? null : { minLength: true };
});

validators.set('maxLength', (val: any, length: number) => {
  if (isEmpty(val)) {
    return null;
  }

  return `${val}`.length <= length ? null : { maxLength: true };
});

validators.set('pattern', (val: any, pattern: RegExp) => {
  if (isEmpty(val)) {
    return null;
  }

  return pattern.test(val) ? null : { pattern: true };
});

validators.set('email', (val: any) => {
  if (isEmpty(val)) {
    return null;
  }

  return EMAIL_REGEXP.test(val) ? null : { email: true };
});

validators.set('equalToControl', (val: any, controlName: string, control: Control) => {
  if (isEmpty(val)) {
    return null;
  }

  return val === control.form.getValue(controlName) ? null : { equalToControl: true };
});

validators.set('callback', (val: any, fn: (value: any, control: Control) => boolean, control: Control) => {
  if (isEmpty(val)) {
    return null;
  }

  return fn(val, control) ? null : { callback: true };
});

export default {
  delete(v: string) { return validators.delete(v); },
  add(v: string, fn: Validator) { return validators.set(v, fn); },
  get(v: string) { return validators.get(v); },
  has(v: string) { return validators.has(v); },
};
