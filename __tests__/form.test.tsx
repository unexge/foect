const React = require('react');
import { shallow, mount } from 'enzyme';
import Form from '../src/form';
import Control from '../src/control';
import Validators from '../src/validators';
import { Status } from '../src/type';

test('renders child', () => {
  const wrapper = mount(
    <Form>
      { _ => <Control name="foo">{ _ => null }</Control> }
    </Form>
  );

  expect(wrapper.find(Control))
    .toHaveLength(1)
});

test('default value', () => {
  const wrapper = shallow(
    <Form defaultValue={{ foo: 'bar' }}>
      { _ => <Control name="foo">{ _ => null }</Control> }
    </Form>
  );

  const instance = wrapper.instance() as Form;

  expect(instance.getValue('foo'))
    .toBe('bar');

  expect(instance.isValid)
    .toBeTruthy();
});

test('form state', () => {
  const wrapper = mount(
    <Form>
      { form => (
        <span>
          <Control name="foo" required>{ _ => null }</Control>

          <span className="status">
            { form.isValid ? 'valid' : null }
            { form.isInvalid ? 'invalid' : null }
          </span>
        </span>
      ) }
    </Form>
  );

  const instance = wrapper.instance() as Form;

  expect(wrapper.find('.status').text())
    .toBe('invalid');

  instance.setValue('foo', 'bar');

  expect(wrapper.find('.status').text())
    .toBe('valid');
});

test('defaults for control', () => {
  const wrapper = mount(
    <Form>
      { _ => <Control name="foo">{ _ => null }</Control> }
    </Form>
  );

  const instance = wrapper.instance() as Form;

  expect(instance.getValue('foo'))
    .toBeFalsy();

  expect(instance.getErrors('foo'))
    .toEqual({});

  expect(instance.getStatus('foo'))
    .toBe(Status.INIT);
});

test('validate control', () => {
  const wrapper = mount(
    <Form>
      { _ => <Control name="foo" required>{ _ => null }</Control> }
    </Form>
  );

  const instance = wrapper.instance() as Form;
  
  expect(instance.getStatus('foo'))
    .toBe(Status.INIT);

  instance.validateControl('foo');

  expect(instance.getStatus('foo'))
    .toBe(Status.INVALID);

  expect(instance.getErrors('foo').required)
    .toBeTruthy();

  expect(instance.status)
    .toBe(Status.INVALID);

  expect(instance.errors.foo.required)
    .toBeTruthy();
});

test('update control value', () => {
  const wrapper = mount(
    <Form>
      { _ => <Control name="foo" required>{ _ => null }</Control> }
    </Form>
  );

  const instance = wrapper.instance() as Form;

  instance.validateControl('foo');  
  
  expect(instance.getStatus('foo'))
    .toBe(Status.INVALID);
    
  instance.setValue('foo', 'bar');

  expect(instance.getValue('foo'))
    .toBe('bar');

  expect(instance.getErrors('foo'))
    .toEqual({});

  expect(instance.getStatus('foo'))
    .toBe(Status.VALID);
});

test('validates default value', () => {
  const wrapper = mount(
    <Form defaultValue={{ foo: 'foobar', bar: 'qux' }}>
      { _ => (
        <span>
          <Control name="foo" minLength={5}>{ _ => null }</Control>
          <Control name="bar" minLength={5}>{ _ => null }</Control>
        </span> 
      ) }
    </Form>
  );

  const instance = wrapper.instance() as Form;

  expect(instance.isValid)
    .toBeFalsy();

  expect(instance.getErrors('foo'))
    .toEqual({});

  expect(instance.getErrors('bar').minLength)
    .toBeTruthy();
});

test('removes unmouted control', () => {
  const wrapper = mount(
    <Form>
      { form => (
        <span>
          { !form.state.unmoutControl && <Control name="foo">{ _ => null }</Control> }
        </span>
      ) }
    </Form>
  );

  const instance = wrapper.instance() as Form;

  expect(instance.state.controls.size)
    .toBe(1);

  wrapper.setState({ unmoutControl: true });

  expect(instance.state.controls.size)
    .toBe(0);
});

test('removes control manually', () => {
  const wrapper = mount(
    <Form>
      { _ => <Control name="foo">{ _ => null }</Control> }
    </Form>
  );

  const instance = wrapper.instance() as Form;

  expect(instance.state.controls.size)
    .toBe(1);

  instance.removeControl('foo');

  expect(instance.state.controls.size)
    .toBe(0);
});

test('updates validation on change', () => {
  const wrapper = mount(
    <Form>
      { _ => (
        <Control name="foo" required minLength={5}>{ control => (
          <input 
            type="text" value={control.value} 
            onChange={event => control.onChange(event.target.value)}
          />
        ) }
        </Control> 
      ) }
    </Form>
  );

  const instance = wrapper.instance() as Form;

  instance.validateControl('foo');

  expect(instance.isValid)
    .toBeFalsy();

  wrapper.find('input').simulate('change', { target: { value: 'bar' } });

  expect(instance.getErrors('foo').require)
    .toBeFalsy();

  expect(instance.getErrors('foo').minLength)
    .toBeTruthy();

  wrapper.find('input').simulate('change', { target: { value: 'barbaz' } });

  expect(instance.getErrors('foo'))
    .toEqual({});

  expect(instance.isValid)
    .toBeTruthy();
});

test('triggers valid submit callback', () => {
  const submitCbMock = jest.fn();

  const wrapper = mount(
    <Form onValidSubmit={submitCbMock} defaultValue={{ foo: 'bar' }}>
      { _ => <Control name="foo" required>{ _ => null }</Control> }
    </Form>
  );

  const instance = wrapper.instance() as Form;

  instance.submit();

  expect(submitCbMock.mock.calls)
    .toHaveLength(1);

  expect(submitCbMock.mock.calls[0][0])
    .toEqual({
      foo: 'bar'
    });
});

test('triggers invalid submit callback', () => {
  const submitCbMock = jest.fn();

  const wrapper = mount(
    <Form onInvalidSubmit={submitCbMock}>
      { _ => <Control name="foo" required>{ _ => null }</Control> }
    </Form>
  );

  const instance = wrapper.instance() as Form;

  instance.submit();

  expect(submitCbMock.mock.calls)
    .toHaveLength(1);

  expect(submitCbMock.mock.calls[0][0])
    .toEqual({
      foo: { required: true }
    });
});

test('validate init controls on submit', () => {
  const validSubmitCbMock = jest.fn();
  const invalidSubmitCbMock = jest.fn();

  const wrapper = mount(
    <Form onInvalidSubmit={validSubmitCbMock} onInvalidSubmit={invalidSubmitCbMock}>
      { _ => (
        <span>
          <Control name="foo" required>{ _ => null }</Control>
          <Control name="bar">{ _ => null }</Control>
        </span>
      ) }
    </Form>
  );

  const instance = wrapper.instance() as Form;
  instance.submit();

  expect(instance.getStatus('foo'))
    .toBe(Status.INVALID);

  expect(instance.getStatus('bar'))
    .toBe(Status.VALID);
  
  expect(validSubmitCbMock.mock.calls)
    .toHaveLength(0);
  
  expect(invalidSubmitCbMock.mock.calls)
    .toHaveLength(1);
});

test('setting errors manually', () => {
  const wrapper = mount(
    <Form defaultValue={{ foo: 'bar' }}>
      { _ => (
        <Control name="foo" required>
          { control => (
            <span className="status">
              { control.isInvalid && 
                control.errors.notUnique && 'not unique' }
            </span>
          ) }
        </Control>
      ) }
    </Form>
  );

  const instance = wrapper.instance() as Form;

  expect(instance.getStatus('foo'))
    .toBe(Status.VALID);

  expect(wrapper.find('.status').text())
    .toBe('');

  instance.setErrors('foo', { notUnique: true });

  expect(instance.getStatus('foo'))
    .toBe(Status.INVALID);

  expect(instance.getErrors('foo'))
    .toEqual({
      notUnique: true
    });

  expect(wrapper.find('.status').text())
    .toBe('not unique');
});

test('dynamic controls', () => {
  const wrapper = mount(
    <Form defaultValue={{ foo: 'bar' }}>
      { form => (
        <span>
          <Control name="foo" required>{ _ => null }</Control>

          { form.state.dynamicControls && 
            form.state.dynamicControls.map(c => 
              <Control key={c.name} name={c.name} required>
                { _ => null }
              </Control>
            ) }
        </span>
      ) }
    </Form>
  );

  const instance = wrapper.instance() as Form;

  expect(instance.status)
    .toBe(Status.VALID);
  
  wrapper.setState({
    dynamicControls: [
      { name: 'qux' }
    ]
  });

  expect(instance.status)
    .toBe(Status.INVALID);

  expect(instance.getStatus('qux'))
    .toBe(Status.INIT);
});

test('dynamic validation rules', () => {
  const wrapper = mount(
    <Form defaultValue={{ foo: 'bar' }}>
      { form => (
        <Control name="foo" required { ...(form.state.dynamicRules) }>
          { _ => null }
        </Control>
      ) }
    </Form>
  );

  const instance = wrapper.instance() as Form;

  expect(instance.status)
    .toBe(Status.VALID);
  
  wrapper.setState({
    dynamicRules: { minLength: 6 }
  });

  expect(instance.status)
    .toBe(Status.INVALID);

  expect(instance.getErrors('foo'))
    .toEqual({
      minLength: true
    });

  wrapper.setState({
    dynamicRules: { minLength: 3 }
  });

  expect(instance.status)
    .toBe(Status.VALID);

  expect(instance.getErrors('foo'))
    .toEqual({});
});

test('submitted state', () => {
  const wrapper = mount(
    <Form>
      { form => (
        <span>
          <Control name="foo" required>{ _ => null }</Control>

          <span className="status">{ form.isSubmitted ? 'submitted' : 'not submitted' }</span>
        </span>
      ) }
    </Form>
  );

  const instance = wrapper.instance() as Form;

  expect(wrapper.find('.status').text())
    .toBe('not submitted');

  instance.submit();

  expect(wrapper.find('.status').text())
    .toBe('submitted');
});

test('equalToControl validator', () => {
  const wrapper = mount(
    <Form>
      { _ => (
        <span>
          <Control name="foo" required minLength={5}>
            { control => (
              <input 
                type="text" value={control.value} 
                onChange={event => control.onChange(event.target.value)}
              />
            ) }
          </Control> 

          <Control name="bar" required equalToControl="foo">
            { control => (
              <input 
                type="text" value={control.value} 
                onChange={event => control.onChange(event.target.value)}
              />
            ) }
          </Control> 
        </span>
      ) }
    </Form>
  );

  const instance = wrapper.instance() as Form;

  instance.setValue('foo', 'foobar');
  instance.setValue('bar', 'qux');

  expect(instance.errors)
    .toEqual({
      bar: { equalToControl: true },
      foo: {}
    });

  wrapper.find(Control).last()
    .simulate('change', { target: { value: 'foobar' } });

  expect(instance.errors)
    .toEqual({
      bar: {},
      foo: {}
    });
});

test('custom validators', () => {
  Validators.add('notEqual', (val: any, to: any) => val !== to ? null : { notEqual: true });

  const wrapper = mount(
    <Form defaultValue={{ foo: 'bar' }}>
      { _ => (
        <Control name="foo" required notEqual="bar">
          { _ => null }
        </Control> 
      ) }
    </Form>
  );

  const instance = wrapper.instance() as Form;

  expect(instance.getErrors('foo'))
    .toEqual({
      notEqual: true
    });
  
  instance.setValue('foo', 'qux');

  expect(instance.getErrors('foo'))
    .toEqual({});

  Validators.delete('notEqual');
});

test('remove control value from model', () => {
  const wrapper = mount(
    <Form>
      { form => (
        <span>
          { (form.state.dynamicControls || []).map((id) => (
            <Control key={id} name={`dynamicControls.${id}`}>{ control => (
              <input id={id} onChange={event => control.onChange(event.target.value)} />
            ) }</Control>
          )) }
        </span>
      ) }
    </Form>
  );

  const instance = wrapper.instance() as Form;

  wrapper.setState({
    dynamicControls: [
      'control-1',
      'control-2',
      'control-3',
    ]
  });

  wrapper.find('#control-1').simulate('change', { target: { value: 'Control #1' } });
  wrapper.find('#control-2').simulate('change', { target: { value: 'Control #2' } });
  wrapper.find('#control-3').simulate('change', { target: { value: 'Control #3' } });

  expect(instance.state.value)
    .toEqual({
      'dynamicControls.control-1': 'Control #1',
      'dynamicControls.control-2': 'Control #2',
      'dynamicControls.control-3': 'Control #3',
    });

  // remove Control #2.
  wrapper.setState(state => ({
    ...state,
    dynamicControls: state.dynamicControls.filter(id => 'control-2' !== id)
  }));

  expect(instance.state.value)
    .toEqual({
      'dynamicControls.control-1': 'Control #1',
      'dynamicControls.control-3': 'Control #3',
    });
});
