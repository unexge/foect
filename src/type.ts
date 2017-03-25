import Control from './control';

export type Validator = (value: any, config?: any, control?: Control) => ValidatorResult;
export type ValidatorResult = null | Errors;
export type Model = { [key: string]: any };
export type FormErrors = { [name: string]: Errors };
export type Errors = { [key: string]: boolean };

export type Status = 'INIT' | 'VALID' | 'INVALID';
export const Status = {
  INIT: 'INIT' as Status,
  VALID: 'VALID' as Status,
  INVALID: 'INVALID' as Status
};
