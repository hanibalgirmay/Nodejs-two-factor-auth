import { gql } from "apollo-server-express"; //will create a schema

const Schema = gql`
  type User {
    id: ID!
    name: String
    email: String
    phone_number: String
    password: String!
  }

  type AuthPayload {
    token: String!
    user: User!
    message: String
    qrcode: String
    secret: String
  }

  type QrcodeResult {
    message: String!
    secretKey: String!
    qrCode: String!
  }

  type Result {
    success: Boolean,
    message: String
  }

  #handle user commands
  type Query {
    getAllUsers: [User] #will return multiple Person instances
    getUserProfile(id: Int): User 
  }

  type Mutation {
    signUp(name: String!, phone_number: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    changePassword(currentPassword: String!, newPassword: String!): Result!
    enableTwoFactorAuth(username: String!): QrcodeResult!
  }
`;
export default Schema;