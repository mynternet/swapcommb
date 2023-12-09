const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Item {
    id: String!
    owner: String!
    description: String!
    image: String
    itemName: String!
    itemStatus: String
    requestByUser: String
    offerToUser: String
    itemToChange: String
    contributions: [Contribution]
    createdAt: String
    location: String 
  }

  type User {
    _id: ID!
    username: String!
    email: String!
    password: String
    createdItems: [Item]
  }

  type Contribution {
    contributorUsername: String!
    contributedAmount: Float
    contributedAt: String
  }

  type Auth {
    token: ID!
    user: User
  }

  input ContributionInput {
    contributorEmail: String!
    contributedAmount: Float
    itemId: String!
  }

  input ItemInput {
    owner: String!
    description: String!
    image: String
    itemName: String!
    itemStatus: String
    location: String
  }

  input CreditCard {
    name: String!
    number: String!
    expirationMonth: String!
    expirationYear: String!
    cvv: String!
  }

  type SwapTransaction {
    id: ID!
    itemOffered: Item!
    itemRequested: Item!
    offeredByUser: User!
    requestedByUser: User!
    status: String!
    transactionDate: String!
  }

  type SwapHistory {
    itemId: ID!
    itemName: String!
    swappedWith: String
    offerToUser: String
    requestByUser: String
  }
   

  type Query {
    me: User
    createdItems: [Item]
    getItemById(itemId: String!): Item
    getAllItems: [Item]
    itemsForSwap(itemToChange: String!): [Item]    
    swapHistory(userId: ID!): [SwapHistory]
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
    addItem(
      description: String!
      owner: String!
      image: String!
      itemName: String!
      itemStatus: String
      location: String
    ): User
    removeItem(itemId: String!): User
    addContribution(
      contributorUsername: String!
      contributedAmount: Float
      itemId: String!
      card: CreditCard!
    ): Item
    deleteItem(itemId: String!): User
    updateItemStatus(
      itemId: ID!
      status: String!
      owner: String
      requestByUser: String
      offerToUser: String
      itemToChange: String
    ): Item
    swapItems(acceptedItemId: ID!, swappedItemId: ID!): SwapStatus
    createSwapTransaction(itemOffered: ID!, itemRequested: ID!, offeredByUser: ID!, requestedByUser: ID!): SwapTransaction
    acceptSwapTransaction(transactionId: ID!): SwapTransaction    
    rejectSwapTransaction(transactionId: ID!): SwapTransaction
    updateOwnerAcceptedTransaction(itemId: ID!, newOwner: String!): Item
  }

  type SwapStatus {
    success: Boolean
    message: String
  }

`;

module.exports = typeDefs;
