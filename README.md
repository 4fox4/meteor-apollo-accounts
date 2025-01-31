Forked from [cult-of-coders/meteor-apollo-accounts](https://github.com/cult-of-coders/meteor-apollo-accounts)

# Meteor Apollo Accounts

A implementation of Meteor Accounts only in GraphQL with Apollo.

This package exposes Meteor Accounts functionality in GraphQL.

## Installing

### Install on Meteor server

```sh
meteor add 4fox4:apollo-accounts
```

Initialize the package.

```js
import { makeExecutableSchema } from 'graphql-tools';
import { initAccounts } from 'meteor/4fox4:apollo-accounts';
import { load, getSchema } from 'graphql-load';

const { typeDefs, resolvers } = initAccounts({
  loginWithFacebook: false,
  loginWithGoogle: false,
  loginWithLinkedIn: false,
  loginWithPhone: false,
  loginWithPassword: true,
  overrideCreateUser: (createUser, _, args, context) {
    // Optionally override createUser if you need custom logic
    // Or simply restrict him from authenticating
  }
});

// optional
load({
  typeDefs,
  resolvers,
});

// Gets all the resolvers and type definitions loaded in graphql-loader
const schema = getSchema();
const executableSchema = makeExecutableSchema(schema);
```

### Install on your apollo app

May or may not be the same app.

```sh
npm install --save meteor-apollo-accounts
```

## Examples

- [janikvonrotz/meteor-apollo-accounts-example](https://github.com/janikvonrotz/meteor-apollo-accounts-example): Meteor client and server side.
- [orionsoft/server-boilerplate](https://github.com/orionsoft/server-boilerplate): Large Meteor server side only starter app.

## Tutorials

- [Using Meteor With Apollo and React](https://blog.orionsoft.io/using-meteor-accounts-with-apollo-and-react-df3c89b46b17#.znozw2zbd)

## Methods

Meteor accounts methods, client side only. All methods are promises.

#### loginWithPassword

Log the user in with a password.

```js
import { loginWithPassword } from "meteor-apollo-accounts";

loginWithPassword({ username, email, password }, apollo);
```

- `username`: Optional. The user's username.

- `email`: Optional. The user's email.

- `password`: The user's password. The library will hash the string before it sends it to the server.

- `apollo`: Apollo client instance.

#### changePassword

Change the current user's password. Must be logged in.

```js
import { changePassword } from "meteor-apollo-accounts";

changePassword({ oldPassword, newPassword }, apollo);
```

- `oldPassword`: The user's current password. This is not sent in plain text over the wire.

- `newPassword`: A new password for the user. This is not sent in plain text over the wire.

- `apollo`: Apollo client instance.

#### logout

Log the user out.

```js
import { logout } from "meteor-apollo-accounts";

logout(apollo);
```

- `apollo`: Apollo client instance.

#### createUser

Create a new user.

```js
import { createUser } from "meteor-apollo-accounts";

createUser({ username, email, password, profile }, apollo);
```

- `username`: A unique name for this user.

- `email`: The user's email address.

- `password`: The user's password. This is not sent in plain text over the wire.

- `profile`: The profile object based on the `UserProfileInput` input type.

- `apollo`: Apollo client instance.

#### verifyEmail

Marks the user's email address as verified. Logs the user in afterwards.

```js
import { verifyEmail } from "meteor-apollo-accounts";

verifyEmail({ token }, apollo);
```

- `token`: The token retrieved from the verification URL.

- `apollo`: Apollo client instance.

#### forgotPassword

Request a forgot password email.

```js
import { forgotPassword } from "meteor-apollo-accounts";

forgotPassword({ email }, apollo);
```

- `email`: The email address to send a password reset link.

- `apollo`: Apollo client instance.

#### resetPassword

Reset the password for a user using a token received in email. Logs the user in afterwards.

```js
import { resetPassword } from "meteor-apollo-accounts";

resetPassword({ newPassword, token }, apollo);
```

- `newPassword`: A new password for the user. This is not sent in plain text over the wire.

- `token`: The token retrieved from the reset password URL.

- `apollo`: Apollo client instance.

#### loginWithFacebook

Logins the user with a facebook accessToken

```js
import { loginWithFacebook } from "meteor-apollo-accounts";

loginWithFacebook({ accessToken }, apollo);
```

- `accessToken`: A Facebook accessToken. It's recommended to use
  https://github.com/keppelen/react-facebook-login to fetch the accessToken.

- `apollo`: Apollo client instance.

#### loginWithGoogle

Logins the user with a google accessToken

```js
import { loginWithGoogle } from "meteor-apollo-accounts";

loginWithGoogle({ accessToken }, apollo);
```

- `accessToken`: A Google accessToken. It's recommended to use
  https://github.com/anthonyjgrove/react-google-login to fetch the accessToken.

- `apollo`: Apollo client instance.

#### Phone support

Login support using phone number and verification code. Requires ujwal:accounts-phone package.

```
meteor add ujwal:accounts-phone
```

From your client, execute the following mutation:

```graphql
mutation createUserWithPhone {
  createUserWithPhone(
    phone: "+11234567890"
    profile: { name: "A Phone User" }
  ) {
    success
  }
}
```

Server response:

```js
{
  "data": {
    "createUserWithPhone": {
      "success": true
    }
  }
}
```

If Twilio has been set up on the server, a verification code will be sent to the phone via SMS.

To login with the verification code, use the following mutation:

```graphql
mutation loginWithPhone {
  loginWithPhone(phone: "+11234567890", verificationCode: "6593") {
    id
    token
    tokenExpires
  }
}
```

Server response:

```js
{
  "data": {
    "loginWithPhone": {
      "id": "eHMzRW9B685curZ63",
      "token": "Kg9mESwmEAs6xraKZ_hPv0tzOvQpTgMPhWTNXDFCet0",
      "tokenExpires": 1535581386595
    }
  }
}
```

You can use the response to store the login token:

```js
await setTokenStore.set(id, token, new Date(tokenExpires));
```

To request a new verification code, use the following mutation:

```graphql
mutation resendPhoneVerification {
  resendPhoneVerification(phone: "+11234567890") {
    success
  }
}
```

Server response:

```js
{
  "data": {
    "resendPhoneVerification": {
      "success": true
    }
  }
}
```

If Twilio has been set up, then the verification code will sent via SMS.

#### onTokenChange

Register a function to be called when a user is logged in or out.

```js
import { onTokenChange } from "meteor-apollo-accounts";

onTokenChange(function () {
  console.log("token did change");
  apollo.resetStore();
});
```

#### userId

Returns the id of the logged in user.

```js
import { userId } from 'meteor-apollo-accounts'

async function () {
  console.log('The user id is:', await userId())
}
```

### React-Native usage

```js
//First you'll need to import the Storage library that you'll use to store the user details (userId, tokens...),
// AsyncStorage is highly recommended.

import {
  ...
  AsyncStorage
} from 'react-native';

import { loginWithPassword, userId, setTokenStore} from 'meteor-apollo-accounts'

// Then you'll have to define a TokenStore for your user data using setTokenStore
// (for instance when your component is mounted):
setTokenStore({
  set: async function ({userId, token, tokenExpires}) {
    await AsyncStorage.setItem('Meteor.userId', userId)
    await AsyncStorage.setItem('Meteor.loginToken', token)
    // AsyncStorage doesn't support Date type so we'll store it as a String
    await AsyncStorage.setItem('Meteor.loginTokenExpires', tokenExpires.toString())
  },
  get: async function () {
    return {
      userId: await AsyncStorage.getItem('Meteor.userId'),
      token: await AsyncStorage.getItem('Meteor.loginToken'),
      tokenExpires: await AsyncStorage.getItem('Meteor.loginTokenExpires')
    }
  }
})

// Finally, you'll be able to use asynchronously any method from the library:
async login (event) {
  event.preventDefault();

  try {
    const id_ = await loginWithPassword({ "email", "password" }, this.client)
    this.client.resetStore()
  } catch (error) {

  }
}
```

## Contributors

- [@theodorDiaconu](https://github.com/theodorDiaconu)
- [@nicolaslopezj](https://github.com/nicolaslopezj)
- [@janikvonrotz](https://github.com/janikvonrotz)
- [@dbrrt](https://github.com/dbrrt)
- [@hammadj](https://github.com/hammadj)
