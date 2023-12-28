const { parsePriceTextToDouble } = require("../../utils");
const CustomScraper = require("../custom-scraper.abstract");
const {
	NOT_EXISTS,
	INVALID_SELECTOR,
	AVAILABLE,
} = require("../product-status.enum");

class TelhanorteScraper extends CustomScraper {
	#priceSelector;
	#productListCountSelector;
	#productListItemSelector;
	#searchUrl;
	#descriptionSelector;

	init({ browser }) {
		super.init(browser);

		this.#productListCountSelector =
			".vtex-search-result-3-x-totalProducts--layout";
		this.#priceSelector = ".telhanorte-telha-store-app-1-x-preco-best-un";
		this.#productListItemSelector = ".vtex-product-summary-2-x-container";
		this.#searchUrl = "https://www.telhanorte.com.br/{ }?_q={ }";
		this.#descriptionSelector = ".vtex-store-components-3-x-productBrand";
	}

	async scrap() {
		await this.#navigateToSearchProductPage();

		await this.#checkProductNotExists();

		if (super.hasResult()) return this.result;

		await this.#navigateToProductPage();

		await this.#checkAvailableProduct();

		return this.result;
	}

	async #navigateToSearchProductPage() {
		await this.browser.searchProductByBarCode(this.#searchUrl, this.barCode);
	}

	async #checkProductNotExists() {
		/**
		 * Esse seletor se refere ao item da lista de produtos mostrados ao realizar a busca
		 */
		const containsProductListItem = await this.browser.pageContainsSelector(
			this.#productListItemSelector
		);
		/**
		 * Esse seletor se refere ao contador de produtos mostrados ao realizar uma busca
		 */
		const containsProductListCount = await this.browser.pageContainsSelector(
			this.#productListCountSelector
		);

		/**
		 * Nenhum dos elementos é apresentado quando o produto não existe
		 */
		if (!containsProductListCount && !containsProductListItem) {
			this.result.status = NOT_EXISTS;
      return;
		}

		/**
		 * Quando o contador existe significa que há um produto retornado na busca
		 * (a busca foi bem sucedida), mas o seletor não capturou o elemento do produto
		 */
		if (!containsProductListItem) {
			this.result.status = INVALID_SELECTOR;
			this.result.selector = this.#productListItemSelector;
		}
	}

	async #navigateToProductPage() {
		await this.browser.clickOnPageElement(this.#productListItemSelector);
	}

	async #checkAvailableProduct() {
		const containsPriceSelector = await this.browser.pageContainsSelector(
			this.#priceSelector
		);

		/**
		 * Uma vez que foi possível chegar até a página do produto,
		 * é certo que o produto existe na loja, porém o seletor de preço não foi encontrado
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
		const priceTxt = await this.browser.getPageInnerText(this.#priceSelector);
		const price = parsePriceTextToDouble(priceTxt);

		this.result = {
			...this.result,
			description,
			status: AVAILABLE,
			price,
		};
	}
}

module.exports = TelhanorteScraper;
