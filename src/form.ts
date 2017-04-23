import { Component, PropTypes } from 'react';
import { FormErrors, Errors, Model, Status } from './type';
import Control from './control';
import { hasError } from './utils';

export interface Props { 
  children: (form: Form) => JSX.Element;
  defaultValue?: Model;
  onChange?: (model: Model) => void;
  onValidSubmit?: (model: Model) => void;
  onInvalidSubmit?: (errors: FormErrors, model: Model) => void;
};

export interface State {
  value: Model;
  controls: Map<string, Control>;
  errors: FormErrors;
  status: { [name: string]: Status };
  submitted: boolean;
};

export default
class Form extends Component<Props, State> {
  static childContextTypes = {
    form: PropTypes.object
  };

  static propTypes = {
    children: PropTypes.func.isRequired,
    defaultValue: PropTypes.object,
    onValidSubmit: PropTypes.func,
    onInvalidSubmit: PropTypes.func,
  };

  static defaultProps = {
    defaultValue: {}
  };

  constructor(props: Props) {
    super(props);

    this.state = { 
      controls: new Map(),
      value: (props.defaultValue as Model), 
      errors: {}, 
      status: {},
      submitted: false
    };

    this.update = this.update.bind(this);
  }

  get status(): Status { 
    return Object
      .keys(this.state.status)
      .some(n => Status.VALID !== this.state.status[n])
      ? Status.INVALID : Status.VALID; 
  }
  get errors(): FormErrors { return this.state.errors; }
  get isValid() { return Status.VALID === this.status; }
  get isInvalid() { return !this.isValid; }
  get isSubmitted() { return this.state.submitted; }

  getChildContext(): { form: Form } {
    return { form: this };
  }

  addControl(name: string, control: Control) {
    let errors: Errors = {};
    let status: Status = Status.INIT;

    if (Object.keys(this.state.value).indexOf(name) > -1) {
      errors = control.runValidation(this.getValue(name));
      status = hasError(errors) ? Status.INVALID : Status.VALID;
    }

    this.setState(state => ({
      ...state, 
      controls: new Map([ ...state.controls, [name, control] ]),
      errors: Object.assign({}, state.errors, { [name]: errors }),
      status: Object.assign({}, state.status, { [name]: status })
    }), this.update);
  }

  removeControl(name: string) {
    this.setState(state => {
      const controls = new Map([ ...state.controls ]);
      const errors = Object.assign({}, state.errors);
      const status = Object.assign({}, state.status);
      const value = Object.assign({}, state.value);      

      controls.delete(name);
      delete errors[name];
      delete status[name];
      delete value[name];

      return { ...state, value, controls, errors, status };
    }, () => {
      this.onChange();
      this.update();
    });
  }

  getValue(name: string): any {
    return this.state.value[name];
  }

  setValue(name: string, value: any) {
    this.setState(state => ({ 
      ...state, value: Object.assign({}, state.value, { [name]: value }) 
    }), () => {
      this.onChange();
      this.validateControl(name); 
    });
  }

  setErrors(name: string, errors: Errors) {
    const status = hasError(errors) ? Status.INVALID : Status.VALID;

    this.setState(state => ({
      ...state, 
      errors: Object.assign({}, state.errors, { [name]: errors }),
      status: Object.assign({}, state.status, { [name]: status })
    }), this.update);
  }

  validateControl(name: string) {
    const control = this.state.controls.get(name) as Control;
    const errors = control.runValidation(this.getValue(name));

    this.setErrors(name, errors);
  }

  getStatus(name: string): Status {
    return this.state.status[name];
  }

  getErrors(name: string): Errors {
    return this.state.errors[name] || {};
  }

  update() {
    this.state.controls.forEach(c => c.forceUpdate());
    
    this.forceUpdate();
  }

  submit() {
    const { status } = this.state;
    const needsToValidate: string[] = [];

    for (const name in status) {
      if (Status.INIT === status[name]) {
        needsToValidate.push(name);
      }
    }

    if (!needsToValidate.length) {
      this.handleSubmit();

      return;
    }

    this.setState(state => {
      const newState = { ...state };

      for (const name of needsToValidate) {
        const control = this.state.controls.get(name) as Control;
        const errors = control.runValidation(this.getValue(name));
        const status = hasError(errors) ? Status.INVALID : Status.VALID;

        newState.errors[name] = errors;
        newState.status[name] = status;
      }

      return newState;
    }, this.handleSubmit);
  }

  handleSubmit() {
    this.setState(state => ({
      ...state,
      submitted: true
    }), () => {
      if (this.isInvalid) {
        this.onInvalidSubmit();

        return;
      }

      this.onValidSubmit();
    });
  }

  onChange() {
    if ('function' === typeof this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  }

  onInvalidSubmit() {
    if ('function' === typeof this.props.onInvalidSubmit) {
      this.props.onInvalidSubmit(this.state.errors, this.state.value);
    }
  }

  onValidSubmit() {
    if ('function' === typeof this.props.onValidSubmit) {
      this.props.onValidSubmit(this.state.value);
    }
  }

  render() {
    return this.props.children(this);
  }
}
