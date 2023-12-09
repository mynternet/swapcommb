const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { typeDefs, resolvers } = require("./schemas");
const { authMiddleware } = require("./utils/auth");
const routes = require("./routes");

//const path = require("path");
const db = require("./config/connection");
//const { Console } = require("console");

// Initialize Express app
const app = express();

// Initialize Apollo Server for GraphQL
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
  introspection: true, // Enable introspection (necessary for GraphQL Playground)
  playground: true,  // Enable GraphQL Playground
});

// Middleware for parsing JSON and urlencoded form data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect ApolloServer with Express
const startApolloServer = async () => {
  await server.start();
  server.applyMiddleware({ app });
};

startApolloServer();

// Use routes for additional REST API endpoints
app.use(routes);

module.exports = app;

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

