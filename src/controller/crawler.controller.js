const Crawler = require("../crawler");

const run = async (req, res) => {
  try {
    const {
      stores,
      products
    } = req.body;
  
    const crawler = new Crawler();
  
    await crawler.load({
      stores,
      products
    })
  
    const result = await crawler.run();
  
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Unexpected error"
    })
  }
}

module.exports = {
  run
}