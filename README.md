[WIP] Foect
----
Simple form validation library for React and React Native.

Example
```js
<Form
  ref={(formRef) => this.formRef = formRef}
  onValidSubmit={(values) => console.log('valid', values)}
>
  <Control name="fullName" required minLength={2} maxLength={32}>
    { control => (
      <div>
        <label htmlFor="fullName">Full Name</label>
        <input 
          id="fullName" type="text" placeholder="Full Name" 
          value={control.value} onChange={event => control.onChange(event.target.value)} />

        { control.isInvalid && <span>Please enter your name.</span> }
      </div>
    ) }
  </Control>

  <Control name="password" required pattern={/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/}>
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
  </Control>

  <Control name="email" required email>
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
  </Control>

  <button onClick={() => this.formRef.submit()} type="submit">Register</button>
</Form>
```
