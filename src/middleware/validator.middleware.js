const express = require('express');

const crawlerMiddleware = express.Router();

crawlerMiddleware.use(async (req, res, next) => {
  const body = req.body;

  if (!body) {
    res.status(400).json({
      message: 'Invalid body'
    })
  }

  const {
    stores,
    products
  } = req.body;

  if (!stores) {
    res.status(400).json({
      message: "'stores' param is required"
    })
    return;
  }

  if (!products) {
    res.status(400).json({
      message: "'products' param is required"
    })
    return;
  }

  if (!Array.isArray(stores)) {
    res.status(400).json({
      message: "'stores' must be an array"
    })
    return;
  }

  if (!Array.isArray(products)) {
    res.status(400).json({
      message: "'products' must be an array"
    })
    return;
  }

  next();
})

module.exports = crawlerMiddleware