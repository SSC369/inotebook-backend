const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });

//const mongoUrl = "mongodb://127.0.0.1:27017/inotebook";

const MongoUrl = process.env.MONGODB_CONNECTION_LINK;

const connectToMongo = async () => {
  try {
    await mongoose.connect(MongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to mongo `Successful");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = connectToMongo;
