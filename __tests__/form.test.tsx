const React = require('react');
import { shallow, mount } from 'enzyme';
import Form from '../src/form';
import Control from '../src/control';
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
    .toBeNull();

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
    .toBeNull();

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
    .toBeNull();

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
          <input type="text" value={control.value} onChange={event => control.onChange(event.target.value)}/>
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
    .toBeNull();

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

  expect(submitCbMock.mock.calls[0][0].foo)
    .toBe('bar');
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

  expect(submitCbMock.mock.calls[0][0].foo.required)
    .toBeTruthy();
});

test('validate init controls on submit', () => {
  const validSubmitCbMock = jest.fn();
  const invalidSubmitCbMock = jest.fn();

  const wrapper = mount(
    <Form onInvalidSubmit={validSubmitCbMock} onInvalidSubmit={invalidSubmitCbMock}>
      { _ => (
        <Control name="foo" required>{ _ => null }</Control>
      ) }
    </Form>
  );

  const instance = wrapper.instance() as Form;
  instance.submit();

  expect(instance.getStatus('foo'))
    .toBe(Status.INVALID);
  
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
});
