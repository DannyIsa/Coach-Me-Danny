const express = require("express");
const cors = require("cors");
const api = require("./routes");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api", api);

module.exports = app;
