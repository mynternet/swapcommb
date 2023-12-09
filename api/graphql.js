// /api/graphql.js
const { ApolloServer } = require('apollo-server-micro');
const { typeDefs, resolvers } = require('../schema');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true, // Enable in development
  playground: true, // Enable in development
});

module.exports = server.createHandler({ path: '/api/graphql' })
