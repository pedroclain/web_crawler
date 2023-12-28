const { parsePriceTextToDouble } = require("../../utils");
const CustomScraper = require("../custom-scraper.abstract");
const {
	NOT_EXISTS,
	INVALID_SELECTOR,
	AVAILABLE,
} = require("../product-status.enum");

class LeorymerlinScraper extends CustomScraper {
	#priceSelector;
	#productNotFoundSelector;
	#searchUrl;
	#descriptionSelector;

	init({ browser }) {
		super.init(browser);

		this.#searchUrl = "https://www.leroymerlin.com.br/search?term={ }&searchTerm={ }&searchType=default&index=production_products";
		this.#productNotFoundSelector =
			".css-ro9qo9-heading-heading--tera-heading--text-align-center-text-color--n600-heading--no-margin";
		this.#priceSelector = ".css-rwb0cd-to-price__integer";
		this.#descriptionSelector = ".product-title";
	}

	async scrap() {
		await this.#navigateToSearchProductPage();

		await this.#checkProductNotExists();

		if (super.hasResult()) return this.result;

		await this.#checkAvailableProduct();

		return this.result;
	}

	async #navigateToSearchProductPage() {
		await this.browser.searchProductByBarCode(this.#searchUrl, this.barCode);
	}

	async #checkProductNotExists() {
		/**
		 * Esse seletor se refere a mensagem de página não encontrada mostrada ao buscar um produto inexistente
		 */
		const productNotFound = await this.browser.pageContainsSelector(
			this.#productNotFoundSelector
		);

		if (productNotFound) {
			this.result.status = NOT_EXISTS;
		}
	}

	async #checkAvailableProduct() {
		const containsPriceSelector = await this.browser.pageContainsSelector(
			this.#priceSelector
		);

		/**
		 * Uma vez que a mensagem de "produto não encontrado" não está presente,
		 * é certo que o produto existe na loja, porém o seletor referente ao preço não foi encontrado
		 */
		if (!containsPriceSelector) {
			this.result.status = INVALID_SELECTOR;
			this.result.selector = this.#priceSelector;
      return;
		}

		const containsDescription = await this.browser.pageContainsSelector(
			this.#descriptionSelector
		);

		const description = containsDescription
			? await this.browser.getPageInnerText(this.#descriptionSelector)
			: "Description not found";

		const priceText = await this.browser.getPageInnerText(
			this.#priceSelector
		);

		const price = parsePriceTextToDouble(priceText);

		this.result = {
			...this.result,
			description,
			status: AVAILABLE,
			price,
		};
	}
}

module.exports = LeorymerlinScraper;
