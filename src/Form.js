import React, { PropTypes, Component } from 'react';

export default
class Form extends Component {
  static childContextTypes = {
    form: PropTypes.object
  };

  static propTypes = {
    children: PropTypes.any.isRequired
  };

  constructor(props) {
    super(props);

    this.state = { controls: new Map() };
  }

  getChildContext() {
    return { form: this };
  }

  addControl(name, control) {
    this.setState(state => ({
      ...state, controls: new Map([ ...state.controls, [name, control] ])
    }))
  }

  updated(name) {
    // TODO: is this necessary?
    this.state.controls.forEach(c => c.forceUpdate());

    this.forceUpdate();
  }

  submit() {
    if (!this.isInit) {
      this.handleSubmit();
      return;
    }

    this.state.controls.forEach(c => {
      if (c.isInit) c.validate();
    });

    this.handleSubmit();
  }

  handleSubmit() {
    if (this.isValid) {
      this.handleValidSubmit();
      return;
    }

    this.handleInvalidSubmit();
  }

  handleValidSubmit() {
    if ('function' === typeof this.props.onValidSubmit) {
      this.props.onValidSubmit(this.value);
    }
  }

  handleInvalidSubmit() {
    if ('function' === typeof this.props.onInvalidSubmit) {
      this.props.onInvalidSubmit(this.errors, this.value);
    }
  }

  get value() { return Array.from(this.state.controls.entries()).reduce((v, c) => Object.assign(v, { [c[0]]: c[1].value }), {}); }
  get status() { return Array.from(this.state.controls.entries()).reduce((v, c) => Object.assign(v, { [c[0]]: c[1].status }), {}); }
  get errors() { return Array.from(this.state.controls.entries()).reduce((v, c) => Object.assign(v, { [c[0]]: c[1].errors }), {}); }
  get isValid() { return Array.from(this.state.controls.values()).every(c => c.isValid); }
  get isInvalid() { return this.isInit || (!this.isPending && !this.isValid); }  
  get isInit() { return Array.from(this.state.controls.values()).some(c => c.isInit); }  
  get isPending() { return Array.from(this.state.controls.values()).some(c => c.isPending); }
  

  render() {
    if ('function' === typeof this.props.children) {
      return this.props.children(this);
    }

    return <span>{this.props.children}</span>;
  }
}
