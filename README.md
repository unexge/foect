[WIP] Foect
----
Simple form validation library for React Native.

Example
```js
<Foect.Form
  onValidSubmit={(values) => console.log('valid', values)}
  onInvalidSubmit={(errors, values) => console.log('invalid', errors)}
>
  { form => (
    <div>
      <Foect.Control name="fullName" required minLength={2} maxLength={32}>
        { control => (
          <div>
            <label htmlFor="fullName">Full Name</label>
            <input 
              id="fullName" type="text" placeholder="Full Name" 
              value={control.value} onChange={event => control.onChange(event.target.value)} />

            { control.isInvalid && <span>Please enter your name.</span> }
          </div>
        ) }
      </Foect.Control>

      <Foect.Control name="password" required pattern={/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/}>
        { control => (
          <div>
            <label htmlFor="password">Password</label>
            <input 
              id="password" type="password" placeholder="Password"
              value={control.value} onChange={event => control.onChange(event.target.value)} />

            { control.isInvalid && 
              <span>
                { control.errors.pattern ?
                  <span>Please provide a strong password.</span> : 
                  <span>Please enter your password.</span> }
              </span> }
          </div>
        ) }
      </Foect.Control>

      <Foect.Control name="email" required email>
        { control => (
          <div>
            <label htmlFor="email">Email</label>
            <input 
              id="email" type="email" placeholder="Email"
              value={control.value} onChange={event => control.onChange(event.target.value)} />

            { control.isInvalid && 
              <span>
                <strong>{control.value}</strong> is not a valid address.
              </span> }
          </div>
        ) }
      </Foect.Control>

      <button disabled={form.isInvalid} onClick={() => form.submit()} type="submit">Register</button>
    </div>
  ) }
</Foect.Form>
```

----
Inspired by [Angular Forms](https://github.com/angular/angular/tree/master/packages/forms).
