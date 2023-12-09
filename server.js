const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");
const path = require("path");
const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");
const { authMiddleware } = require("./utils/auth");
const routes = require("./routes");

// Initialize Express
const app = express();

// CORS configuration
const corsOptions = {
  origin: "https://swapcomm.vercel.app", // Your frontend URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204
};

// Enable CORS using the corsOptions
app.use(cors(corsOptions));

// Middleware for parsing JSON and urlencoded form data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Initialize Apollo Server for GraphQL
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});

// Connect ApolloServer with Express
const startApolloServer = async () => {
  await server.start();
  server.applyMiddleware({ app });

  // Database connection
  db.once("open", () => {
    console.log(`Connected to database`);
  });
};

startApolloServer();

// Use routes (for additional REST API endpoints if you have any)
app.use(routes);

// Export the app for serverless deployment
module.exports = app;

