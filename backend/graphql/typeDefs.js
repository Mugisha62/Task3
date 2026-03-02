const { gql } = require("apollo-server-express");

module.exports = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  type Task {
    id: ID!
    title: String!
    description: String!
    user: User!
  }

  type Query {
    getTasks: [Task]
  }

  type Mutation {
    createTask(title: String!, description: String!): Task
  }
`;