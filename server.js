const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
require("dotenv").config();

const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/mongoJoinsDemo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.get("/", (req, res) => {
  res.send("Hello, welcome to the MongoDB Joins Demo API");
});
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
