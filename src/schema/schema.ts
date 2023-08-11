import { gql } from "apollo-server-express";

const Schema = gql`
  type User {
    id: ID!
    name: String
    email: String
    phone_number: String
    password: String
  }

  type AuthPayload {
    token: String
    user: User
    message: String
    qrcode: String
    secret: String
  }

  type QrcodeResult {
    message: String
    token: String
  }

  type Result {
    success: Boolean
    message: String
    user: User
  }

  type Query {
    getUserProfile: QrcodeResult! 
  }

  type Mutation {
    signUp(name: String!, phone_number: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    changePassword(currentPassword: String!, newPassword: String!): Result!
    loginWithTwoFactorAuth(email: String!,verificationCode: String!): QrcodeResult!
  }
`;
export default Schema;