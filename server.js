const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");
const { typeDefs, resolvers } = require("./schemas");
const { authMiddleware } = require("./utils/auth");
const routes = require("./routes");
const db = require("./config/connection");

// Initialize Express app
const app = express();

// CORS configuration
const corsOptions = {
    //origin: "https://swapcomm.vercel.app", // Replace with your frontend domain
    origin: '*', 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Allow session cookie from browser to pass through
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
    context: authMiddleware,
    introspection: true, // Enable introspection (necessary for GraphQL Playground)
    playground: true,  // Enable GraphQL Playground
});

// Connect ApolloServer with Express
const startApolloServer = async () => {
    await server.start();
    server.applyMiddleware({ app });
};

startApolloServer();

// Use routes for additional REST API endpoints
app.use(routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

