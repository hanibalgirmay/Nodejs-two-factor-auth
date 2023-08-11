Project Name
Project Name is a sample application built with Node.js, TypeScript, Apollo GraphQL, and features authentication with login, signup, change password, and two-way QR code functionality.

Prerequisites
Make sure you have the following installed:

Node.js (version X.X.X)
npm (version X.X.X)
MongoDB (version X.X.X)
Getting Started
Clone the repository:

bash
Copy
git clone https://github.com/your-username/project-name.git
```

Install the dependencies:

bash
Copy
cd project-name
npm install
```

Set up the environment variables:

Create a .env file in the root directory

Add the following environment variables:

Copy
PORT=3000
MONGODB_URI=mongodb://localhost:27017/project-name
JWT_SECRET=your-jwt-secret
Replace your-jwt-secret with your own secret key for JWT token generation.

Start the application:

bash
Copy
npm start
```

The application will be running at `http://localhost:4000`.

Project Structure
stylus
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
Features
User authentication (login, signup, change password)
Two-way QR code authentication
Technologies Used
Node.js
TypeScript
Apollo Server
GraphQL
MongoDB
bcryptjs
speakeasy
qrcode
API Endpoints
The API endpoints are accessible at http://localhost:4000/graphql.

POST /graphql: GraphQL endpoint for executing queries and mutations
Examples
Signup
graphql
Copy
mutation {
  signUp(name: "John Doe", email: "john@example.com", phone_number: "1234567890", password: "password") {
    token
    user {
      id
      name
      email
    }
    message
    qrcode
    secret
    verificationCode
  }
}
Login
graphql
Copy
mutation {
  login(email: "john@example.com", password: "password") {
    token
    user {
      id
      name
      email
    }
  }
}
Change Password
graphql
Copy
mutation {
  changePassword(currentPassword: "password", newPassword: "newpassword") {
    success
    message
  }
}
Login with Two-Factor Authentication
graphql
Copy
mutation {
  loginWithTwoFactorAuth(email: "john@example.com", verificationCode: "123456") {
    token
  }
}
Contributing
Contributions are welcome! If you find any issues or have suggestions for improvements, please feel free to open an issue or submit a pull request.

License
MIT License

Feel free to customize the README.md according to your project's specific details and requirements. Make sure to include any additional instructions or guidelines that may be relevant to running or contributing to your project.