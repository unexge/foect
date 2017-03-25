Foect 
[![Build Status](https://travis-ci.org/unexge/foect.svg?branch=master)](https://travis-ci.org/unexge/foect)
[![npm version](https://badge.fury.io/js/foect.svg)](https://badge.fury.io/js/foect)
----
Simple form validation library for React Native.

## Installing
Npm
```
npm i --save foect
```

Yarn
```
yarn add foect
```

## Quick Start
```jsx
import { TextInput, Text, View, Button } from 'react-native';
import Foect from 'foect';

// ...

<Foect.Form
  defaultValue={{
    email: 'john@doe.com'
  }}
  onValidSubmit={model => {
    console.log(model); // { fullName: 'John Doe', email: 'john@doe.com' ... }
  }}
>
  { /* you can use form for triggering submit or checking form state(form.isSubmitted, form.isValid, ...) */ }
  { form => (
    <View>
      { /* every Foect.Control must have a name and optionally validation rules */ }
      <Foect.Control name="fullName" required minLength={2} maxLength={32}>
        { /* you can use control for getting/setting it's value, checking/updating(control.isValid, control.markAsTouched(), ...) it's state, checking it's errors(control.errors.required) */ }
        { control => (
          <View>
            <Text>Full Name</Text>

            <TextInput
              style={{height: 40, borderColor: 'gray', borderWidth: 1}}
              { /* mark control as touched on blur */ }
              onBlur={control.markAsTouched}
              { /* update control's value */ }
              onChangeText={(text) => control.onChange(text)}
              { /* get control's value */ }
              value={control.value}
            />

            { /* check control state and show error if necessary */ }
            { control.isTouched &&
              control.isInvalid && 
              <Text style={{ color: 'red' }}>Please enter your name.</Text> }
          </View>
        ) }
      </Foect.Control>

      <Foect.Control name="password" required pattern={/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/}>
        { control => (
          <View>
            <Text>Password</Text>

            <TextInput
              style={{height: 40, borderColor: 'gray', borderWidth: 1}}
              secureTextEntry={true}
              onBlur={control.markAsTouched}
              onChangeText={(text) => control.onChange(text)}
              value={control.value}
            />

            { control.isTouched &&
              control.isInvalid && 
              <View>
                { control.errors.pattern ?
                  <Text style={{ color: 'red' }}>Please provide a strong password.</Text> : 
                  <Text style={{ color: 'red' }}>Please enter your name.</Text> }
              </View> }
          </View>
        ) }
      </Foect.Control>

      <Foect.Control name="email" required email>
        { control => (
          <View>
            <Text>Email</Text>

            <TextInput
              style={{height: 40, borderColor: 'gray', borderWidth: 1}}
              keyboardType="email-address"
              onBlur={control.markAsTouched}
              onChangeText={(text) => control.onChange(text)}
              value={control.value}
            />

            { control.isTouched &&
              control.isInvalid && 
              <View>
                <Text>{control.value} is not a valid email.</Text>
              </View> }
          </View>
        ) }
      </Foect.Control>

      { /* submit form */ }
      <Button disabled={form.isInvalid} onPress={() => form.submit()} title="Register" />
    </View>
  ) }
</Foect.Form>
```

## Documentation

### Types
```ts
type Status = 'INIT' | 'VALID' | 'INVALID';
```
```ts
type Model = { [key: string]: any };
// { firstName: 'John', lastName: 'Doe' }
```
```ts
type Errors = { [key: string]: boolean };
// { required: true, email: true }
type FormErrors = { [name: string]: Errors };
// { firstName: { required: true, minLength: true } }
```
```ts
type Validator = (value: any, config?: any, control?: Control) => ValidatorResult;
type ValidatorResult = null | Errors;
```

### Props
#### Form
* `children: Function` child renderer function.
* `defaultValue?: Model` default values for form.
* `onValidSubmit?: (model: Model)` callback called on valid submit.
* `onInvalidSubmit?: (errors: FormErrors, model: Model)` callback called on invalid submit.

#### Control
* `children: Function` child renderer function.
* `name: Function` control name.
* `[validator: string]: any;` validation rules for control.

### APIs
#### Form
* `status: Status` form status.
* `errors: FormErrors` form errors.
* `isValid: boolean` is form valid.
* `isInvalid: boolean` is form invalid.
* `isSubmitted: boolean` is form submitted.

* `addControl(name: string, control: Control)` adds a new control to form.
* `removeControl(name: string)` removes a control from form.
* `getValue(name: string)` returns value of a control.
* `setValue(name: string, value: any)` sets value for a control.
* `getErrors(name: string): Status` returns errors of a control.
* `setErrors(name: string, errors: Errors)` sets errors for a control.
* `validateControl(name: string)` validates a control and updates control state, errors.
* `getStatus(name: string): Status` returns status of a control.
* `update()` force updates form and all child controls.
* `submit()` submits the form. calls `onInvalidSubmit` or `onValidSubmit` callback if provided.

#### Control
* `value: any` control value.
* `form: Form` control's form.
* `status: Status` control status.
* `errors: Errors` control errors.
* `isValid: boolean` is control valid.
* `isInvalid: boolean` is control invalid.
* `isTouched: boolean` is control touched.
* `isUntouched: boolean` is control untouched.

* `onChange(value: any)` updates control's value.
* `markAsTouched()` marks control as touched.
* `markAsUntouched()` marks control as untouched.
* `runValidation(value: any): Errors` runs validation with a value and returns errors.

#### Validators

##### Default validators
| Validator        | Options        |
| -------------    |:-------------:|
| required         | - |
| minLength        | `length: number` |
| maxLength        | `length: number` |
| pattern          | `pattern: RegExp` |
| email            | - |
| equalToControl   | `controlName: string` |

Options are passed via props
```jsx
<Foect.Control
  name="password2"
  myValidator={{foo: 'bar'}}
>
```
with this definition, `myValidator` called with `('value of the input', {foo: 'bar'}, controlRef)`

You can add your own validators via `Foect.Validators.add`.
Validators must return null on valid value and object with errors on invalid value. For example:
```ts
Foect.Validators.add('equalToControl', (val: any, controlName: string, control: Control) => {
  if (null === val) {
    return null;
  }

  return val === control.form.getValue(controlName) ? null : { equalToControl: true };
}))
```

* `Foect.Validators.add(validatorName: string, fn: Validator)` adds a new validator.
* `Foect.Validators.get(validatorName: string): Validator` returns a validator.
* `Foect.Validators.has(validatorName: string): boolean` returns whether a validator exists.
* `Foect.Validators.delete(validatorName: string)` deletes a validator.

----
Inspired by [Angular Forms](https://github.com/angular/angular/tree/master/packages/forms).
