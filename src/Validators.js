const validators = new Map();

const EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
const isEmpty = val => null === val || undefined === val;

validators.set('required', val => !isEmpty(val) && !!val);
validators.set('minLength', length => val => isEmpty(val) || `${val}`.length >= length);
validators.set('maxLength', length => val => isEmpty(val) || `${val}`.length <= length);
validators.set('pattern', pattern => val => isEmpty(val) || pattern.test(val));
validators.set('email', val => isEmpty(val) || EMAIL_REGEXP.test(val));

export default {
  delete(v) { return validators.delete(v); },
  add(v, fn) { return validators.set(v, fn); },
  get(v) { return validators.get(v); },
  has(v) { return validators.has(v); },
  all() { return Array.from(validators.entries()).reduce((obj, v) => Object.assign(obj, { [v[0]]: v[1] }), {}); },
};
