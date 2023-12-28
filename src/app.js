const express = require("express");
const crawlerMiddleware = require("./middleware/validator.middleware");
const crawlerController = require("./controller/crawler.controller");

const app = express();
app.use(express.json());

app.use("/run", crawlerMiddleware);
app.post("/run", async (req, res) => {
  await crawlerController.run(req, res);
});

module.exports = app;