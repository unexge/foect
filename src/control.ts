import { PropTypes, Component } from 'react';
import * as isEqual from 'lodash.isequal';
import { Status, Errors, Validator } from './type';
import Form from './form';
import Validators from './validators';

function isValidationRulesChanged(
  currentProps: Props,
  nextProps: Props
): boolean {
  const oldRules = Object.keys(currentProps).filter(Validators.has);
  const newRules = Object.keys(nextProps).filter(Validators.has);

  if (oldRules.length !== newRules.length) {
    return true;
  }

  for (const rule of oldRules) {
    if ('function' !== typeof currentProps[rule] && !isEqual(currentProps[rule], nextProps[rule])) {
      return true;
    }
  }

  return false;
}

export interface Props {
  name: string;
  children: (control: Control) => JSX.Element;

  [validator: string]: any;
};

export interface State {
  touched: boolean;
};

export interface Context {
  form: Form
};

export default
class Control extends Component<Props, State> {
  context: Context;

  static contextTypes = {
    form: PropTypes.object.isRequired
  };

  static propTypes = {
    name: PropTypes.string.isRequired,
    children: PropTypes.func.isRequired
  };

  constructor(props: Props, context: Context) {
    super(props, context);

    this.state = { touched: false };

    this.onChange = this.onChange.bind(this);
    this.markAsTouched = this.markAsTouched.bind(this);
    this.markAsUntouched = this.markAsUntouched.bind(this);
  }

  get value(): any { return this.context.form.getValue(this.props.name) || ''; }
  get form(): Form { return this.context.form; }
  get status(): Status { return this.context.form.getStatus(this.props.name); }
  get errors(): Errors { return this.context.form.getErrors(this.props.name); }
  get isValid() { return Status.VALID === this.status; }
  get isInvalid() { return !this.isValid; }
  get isTouched() { return this.state.touched; }
  get isUntouched() { return !this.isTouched; }

  componentWillMount() {
    this.context.form.addControl(this.props.name, this);
  }

  componentDidUpdate(prevProps: Props) {
    if (isValidationRulesChanged(prevProps, this.props)) {
      this.context.form.validateControl(this.props.name);
    }
  }

  componentWillUnmount() {
    this.context.form.removeControl(this.props.name);
  }

  onChange(value: any) {
    this.context.form.setValue(this.props.name, value);
  }

  markAsTouched() { !this.state.touched && this.setState({ touched: true }); }
  markAsUntouched() { this.state.touched && this.setState({ touched: false }); }

  runValidation(value: any): Errors {
    return Object
      .keys(this.props)
      .filter(Validators.has)
      .reduce((errors, v) => {
        const error = (Validators.get(v) as Validator)(value, this.props[v], this);

        if (null !== error) {
          Object.assign(errors, error);
        }

        return errors;
      }, {});
  }

  render() {
    return this.props.children(this);
  }
}
