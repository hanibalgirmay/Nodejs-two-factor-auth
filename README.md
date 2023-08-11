# Nodejs Authentication System Including Two-Factor Authorization

Nodejs-auth is an application built with Node.js, TypeScript, Apollo GraphQL, and features authentication with login, signup, change password, and two-way QR code functionality.

## Prerequisites

Make sure you have the following installed:

- Node.js (version 18.16.0)
- Yarn (version 1.22.19)
- Mongoose (version 7.4.2)

## Getting Started

Clone the repository:

```bash
git clone https://github.com/hanibalgirmay/Nodejs-two-factor-auth.git
```

# Install the dependencies:

```bash
Copy
cd project-name
yarn install
```

## Set up the environment variables:

Create a .env file in the root directory

Add the following environment variables:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/project-name
JWT_SECRET=your-jwt-secret
Replace your-jwt-secret with your own secret key for JWT token generation.
```

Start the application:

```bash
yarn start
```

The application will be running at `http://localhost:4000`.

Project Structure
stylus

```
Copy
project-name/
├── src/
│   |
│   ├── models/
│   │   └── User.ts
│   |
│   ├── schemas/
│   │   ├── resolver.ts
│   │   └── schema.ts
│   ├── services/
│   │   ├── authService.ts
│   │   └── userService.ts
│   ├── utils/
│   │   └── database.ts
│   |
│   └── main.ts
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Features
User authentication (login, signup, change-password)
- Two-way QR code authentication

### Technologies Used
- Node.js
- TypeScript
- Apollo Server
- GraphQL
- MongoDB
- bcryptjs
- speakeasy
- qrcode
- Graphql Endpoints

## The API endpoints are accessible at http://localhost:4000/graphql.

POST /graphql: GraphQL endpoint for executing queries and mutations
# Examples

### Signup
```graphql
mutation {
  signUp(name: "Hanibal", email: "hanibal@example.com", phone_number: "91278362323", password: "password") {
    token
    user {
      id
      name
      email
    }
    message
    qrcode
    secret
  }
}
```
- Error message
````graphql
{
  "data": {
    "signUp": {
      "token": null,
      "secret": null,
      "message": "Email already exists",
      "qrcode": null,
      "user": null
    }
  }
}
````
- on Success 
````graphql 
{
  "data": {
    "signUp": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGQ2NGY1NGE1ZmI5Mjc1ZmRkZDVkY2UiLCJpYXQiOjE2OTE3NjY2MTIsImV4cCI6MTY5MTc3MDIxMn0.0qxArysYMtjxAR0FABJ7Zw5yyWFyb7tJGAWSXPPR-jA",
      "secret": "********************",
      "message": null,
      "qrcode": "data:image/png;base64,******************************",
      "user": {
        "id": "64d64f54a5fb9275fddd5dce",
        "name": "User Name"
      }
    }
  }
}
````

## QRcode Screenshoot
![Preview Image](./screenshot/Screenshot%202023-08-11%20081100.png)
![Preview Image](./screenshot/photo_2023-08-11_10-56-51.jpg)
![Preview Image](./screenshot/photo_2023-08-11_10-56-54%20(2).jpg)

### Login
````graphql
mutation {
  login(email: "hanibal@example.com", password: "password") {
    token
    user {
      id
      name
      email
    }
  }
}
````

### Change Password
- Add Authorization header then request to change password
````graphql
mutation {
  changePassword(currentPassword: "password", newPassword: "newpassword") {
    success
    message
  }
}
````
### Login with Two-Factor Authentication
- Get Verification code from authenticator application
````graphql
Copy
mutation {
  loginWithTwoFactorAuth(email: "hanibal@example.com", verificationCode: "123456") {
    token
    message
  }
}
````

````graphql
- Needed authentication header token  
query GetUserProfile {
  getUserProfile {
    message
   token
  }
}
````

## Hanibal Girmay
