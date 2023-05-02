const express = require("express");
const cors = require("cors");
//connecting to mongoDB//
const connectToMongo = require("./db");
connectToMongo();

const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`iNotebook app listening on port ${PORT}`);
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.get("/", (req, res) => {
  res.send("Hello SSC!");
});
