const puppeteer = require("puppeteer");

class Browser {
	#browser;
	#page;

	async init() {
		this.#browser = await puppeteer.launch({ headless: false });
		this.#page = await this.#browser.newPage();

		await this.#page.setViewport({ width: 1200, height: 800 });
	}

	async searchProductByBarCode(url, codigoBarras) {
		try {
			await this.#page.goto(url.replace("{ }", codigoBarras), {
				waitUntil: "load",
			});
			return true;
		} catch (err) {
			return false;
		}
	}

	async pageContainsSelector(selector) {
		try {
			await this.#page.waitForSelector(selector, { timeout: 5000 });

			return true;
		} catch (err) {
			return false;
		}
	}

	async getPageInnerText(selector) {
		return await this.#page.$eval(selector, (el) => el.innerText.trim());
	}

	async clickOnPageElement(selector) {
		await this.#page.click(selector);
	}

	async close() {
		await this.#page.close();
		await this.#browser.close();
	}
}

module.exports = Browser;
