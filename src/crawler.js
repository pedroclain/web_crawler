const Browser = require("./browser");
const CustomScraperBuilder = require("./stores/custom-scraper.builder");

class Crawler {
  #stores;
  #products;
	#storeResult
	#finalResult;
	#browser;

	async load({ products, stores }) {
		this.#finalResult = [];
    this.#products = products;
    this.#stores = stores;
		this.#browser = new Browser();
		await this.#browser.init();
	}

	async run() {
		for (const store of this.#stores) {
      const scraper = CustomScraperBuilder.prototype.build(store);
      this.#storeResult = {
        store: store,
        products: []
      }

      scraper.init({
        browser: this.#browser,
      });

      await this.#scrapProducts(scraper);

      this.#finalResult.push(this.#storeResult);
		}
    
    await this.#browser.close();
    return this.#finalResult;
	}

  async #scrapProducts(scraper) {
    for (const productBarCode of this.#products) {
      scraper.setBarCode(productBarCode);

      const result = await scraper.scrap();
      this.#storeResult.products.push(result);
    }
  }
}

module.exports = Crawler;
