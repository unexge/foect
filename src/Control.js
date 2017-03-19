import { PropTypes, Component } from 'react';
import Validators from './Validators';

const isPromise = val => val && val.then;

export default
class Control extends Component {
  static contextTypes = {
    form: PropTypes.object.isRequired
  };

  static propTypes = {
    name: PropTypes.string.isRequired,
    children: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = { value: '', status: 'INIT', errors: null };

    this.notifyChange = this.notifyChange.bind(this);
    this.setStatus = this.setStatus.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
  }

  componentDidMount() {
    this.context.form.addControl(this.props.name, this);
  }

  notifyChange() {
    this.context.form.updated(this.props.name);
  }

  validate() {
    const errors = this.runValidator();

    if (!isPromise(errors)) {
      this.updateStatus(errors);

      return;
    }

    this.setStatus('PENDING');

    errors.then(this.updateStatus);
  }

  updateStatus(errors) {
    this.setState({ errors });

    if (null === errors) {
      this.setStatus('VALID');

      return;
    }

    this.setStatus('INVALID');
  }

  setStatus(status) {
    this.setState({ status }, this.notifyChange);
  }

  runValidator() {
    const syncValidator = this.getValidator();

    const syncValidationErrors = syncValidator(this.value, this.context.form);

    if (null !== syncValidationErrors) {
      return syncValidationErrors;
    }

    const asyncValidator = this.getAsyncValidator();

    if (null === asyncValidator) {
      return null;
    }

    return asyncValidator(this.value, this.context.form); 
  }

  getValidator() {
    return (val, form) => Object.keys(Validators.all()).reduce((errors, v) => {
      if (this.props[v]) {
        let validator = Validators.get(v);

        if ('boolean' !== typeof this.props[v]) {
          validator = validator(this.props[v]);
        }

        if (!validator(val, form)) {
          if (null === errors) {
            errors = { [v]: true };
          } else {
            Object.assign(errors, { [v]: true });
          }
        }
      }

      return errors;
    }, null);
  }

  getAsyncValidator() {
    return null;
  }

  onChange(value) {
    this.setState({ value }, () => {
      this.notifyChange();

      this.validate();
    });
  }

  get value() { return this.state.value; }
  get status() { return this.state.status; }
  get errors() { return this.state.errors; }
  get isInit() { return 'INIT' === this.state.status; }
  get isValid() { return 'VALID' === this.state.status; }
  get isInvalid() { return 'INVALID' === this.state.status; }
  get isPending() { return 'PENDING' === this.state.status; }

  render() {
    return this.props.children(this);
  }
}
