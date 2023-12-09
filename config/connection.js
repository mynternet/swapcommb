const mongoose = require("mongoose");

// Replace the below connection string with your MongoDB Atlas connection string
const atlasConnectionString = "mongodb+srv://user:Swapcomm123.@cluster0.wli66cj.mongodb.net/swapcommdb?retryWrites=true&w=majority";

mongoose.connect(
  process.env.MONGODB_URI || atlasConnectionString,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

module.exports = mongoose.connection;
