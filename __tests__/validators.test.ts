import Validators from '../src/validators';

test('required', () => {
  expect(Validators.get('required')(null))
    .toEqual({ required: true });

  expect(Validators.get('required')(''))
    .toEqual({ required: true });

  expect(Validators.get('required')('  '))
    .toEqual({ required: true });

  expect(Validators.get('required')('ok'))
    .toBeNull();
});

test('minLength', () => {
  expect(Validators.get('minLength')(null))
    .toBeNull();

  expect(Validators.get('minLength')('ok', 3))
    .toEqual({ minLength: true });

  expect(Validators.get('minLength')('foobar', 3))
    .toBeNull();
});

test('maxLength', () => {
  expect(Validators.get('maxLength')(null))
    .toBeNull();

  expect(Validators.get('maxLength')('foobar', 3))
    .toEqual({ maxLength: true });

  expect(Validators.get('maxLength')('ok', 3))
    .toBeNull();
});

test('pattern', () => {
  expect(Validators.get('pattern')(null))
    .toBeNull();

  expect(Validators.get('pattern')('foobar', /^baz$/))
    .toEqual({ pattern: true });

  expect(Validators.get('pattern')('baz', /^baz$/))
    .toBeNull();
});

test('email', () => {
  expect(Validators.get('email')(null))
    .toBeNull();

  expect(Validators.get('email')('johndoe'))
    .toEqual({ email: true });

  expect(Validators.get('email')('john@doe.com'))
    .toBeNull();
});

test('equalToControl', () => {
  const mockControl = {
    get form() { 
      return { 
        getValue() { return 'bar'; } 
      } 
    }
  };

  expect(Validators.get('equalToControl')(null, 'foo', mockControl as any))
    .toBeNull();

  expect(Validators.get('equalToControl')('baz', 'foo', mockControl as any))
    .toEqual({ equalToControl: true });

  expect(Validators.get('equalToControl')('bar', 'foo', mockControl as any))
    .toBeNull();
});

test('callback', () => {
  const mockControl = {
    get form() { 
      return { 
        getValue() { return 'bar'; } 
      } 
    }
  };

  expect(Validators.get('callback')('bar', (value: any) => value !== 'bar', mockControl as any))
    .toEqual({ callback: true });

  expect(Validators.get('callback')('baz', (value: any) => value !== 'bar', mockControl as any))
    .toBeNull();
});
