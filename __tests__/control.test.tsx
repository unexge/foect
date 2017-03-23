const React = require('react');
import { shallow, mount } from 'enzyme';
import Form from '../src/form';
import Control from '../src/control';
import { Status } from '../src/type';

const mockForm = {
  addControl() {},
  removeControl() {},
  setValue() {},
  getValue() {},
}

test('lifecycle methods', () => {
  const mockAddControl = jest.fn();
  const mockRemoveControl = jest.fn();

  const wrapper = mount(
    <Control name="foo">
      { _ => null }
    </Control>,
    { context: { form: Object.assign({}, mockForm, { 
      addControl: mockAddControl, 
      removeControl: mockRemoveControl, 
    }) } }
  );

  expect(mockAddControl.mock.calls)
    .toEqual([[
      'foo', wrapper.instance()
    ]]);
  
  wrapper.unmount();

  expect(mockRemoveControl.mock.calls)
    .toEqual([[
      'foo'
    ]]);
});

test('touched state', () => {
  const wrapper = mount(
    <Form>
      { _ => (
        <Control name="foo">
          { control => (
            <span>
              <input 
                type="text" 
                onBlur={control.markAsTouched} 
                onTouchStart={control.markAsUntouched} 
              />
              <span className="status">
                { control.isTouched ? 'touched' : 'untouched' }
              </span>
            </span>
          ) }
        </Control>
      ) }
    </Form>
  );

  expect(wrapper.find('.status').text())
    .toBe('untouched');

  wrapper.find('input').simulate('blur');

  expect(wrapper.find('.status').text())
    .toBe('touched');

  wrapper.find('input').simulate('touchstart');

  expect(wrapper.find('.status').text())
    .toBe('untouched');
});

test('run validation', () => {
  const wrapper = mount(
    <Control name="foo" required email>
      { _ => null }
    </Control>,
    { context: { form: mockForm } }
  );

  const instance = wrapper.instance() as Control;

  expect(instance.runValidation(null))
    .toEqual({ required: true });

  expect(instance.runValidation('  '))
    .toEqual({ email: true, required: true });

  expect(instance.runValidation('foo'))
    .toEqual({ email: true });

  expect(instance.runValidation('foo@bar.com'))
    .toBeNull();
});

test('update value', () => {
  const mockSetValue = jest.fn();

  const wrapper = mount(
    <Control name="foo">
      { control => (
        <input 
          type="text" value={control.value} 
          onChange={event => control.onChange(event.target.value)} 
        />
      ) }
    </Control>,
    { context: { form: Object.assign({}, mockForm, { setValue: mockSetValue }) } }
  );

  wrapper.find('input').simulate('change', { target: { value: 'foo' } });
  wrapper.find('input').simulate('change', { target: { value: 'bar' } });

  expect(mockSetValue.mock.calls)
    .toEqual([
      ['foo', 'foo'],
      ['foo', 'bar'],
    ]);
});

test('state values', () => {
  const wrapper = mount(
    <Form>
      { _ => (
        <Control name="foo" required minLength={4}>
          { control => (
            <span>
              <input 
                type="text" value={control.value} 
                onChange={event => control.onChange(event.target.value)} 
              />

              <span className="value">{control.value}</span>
              <span className="status">{control.status}</span>
              <span className="errors">{JSON.stringify(control.errors)}</span>
              <span className="isInit">{JSON.stringify(control.isInit)}</span>
              <span className="isValid">{JSON.stringify(control.isValid)}</span>
              <span className="isInvalid">{JSON.stringify(control.isInvalid)}</span>
            </span>
          ) }
        </Control>
      ) }
    </Form>
  );

  expect(wrapper.find('.value').text())
    .toBeFalsy();

  expect(wrapper.find('.status').text())
    .toBe(Status.INIT);

  expect(wrapper.find('.errors').text())
    .toBe('null');

  expect(wrapper.find('.isInit').text())
    .toBe('true');

  expect(wrapper.find('.isValid').text())
    .toBe('false');

  expect(wrapper.find('.isInvalid').text())
    .toBe('false');

  wrapper.find('input').simulate('change', { target: { value: 'foo' } });

  expect(wrapper.find('.value').text())
    .toBe('foo');

  expect(wrapper.find('.status').text())
    .toBe(Status.INVALID);

  expect(wrapper.find('.errors').text())
    .toBe(JSON.stringify({ minLength: true }));

  wrapper.find('input').simulate('change', { target: { value: 'foobar' } });

  expect(wrapper.find('.value').text())
    .toBe('foobar')

  expect(wrapper.find('.status').text())
    .toBe(Status.VALID);

  expect(wrapper.find('.errors').text())
    .toBe('null');

  expect(wrapper.find('.isInit').text())
    .toBe('false');

  expect(wrapper.find('.isValid').text())
    .toBe('true');

  expect(wrapper.find('.isInvalid').text())
    .toBe('false');
});
