const { parsePriceTextToDouble } = require("../../utils");
const CustomScraper = require("../custom-scraper.abstract");
const {
	NOT_EXISTS,
	INVALID_SELECTOR,
	AVAILABLE,
} = require("../product-status.enum");

class ChatubaScraper extends CustomScraper {
	#absolutePriceSelector;
	#decimalPriceSelector;
	#productUnavailableSelector;
	#productNotFoundSelector;
	#productListItemSelector;
	#searchUrl;
	#descriptionSelector;

	init({ browser }) {
		super.init(browser);

		this.#searchUrl = "https://www.chatuba.com.br/{ }?_q={ }&map=ft";
		this.#productNotFoundSelector =
			".vtex-rich-text-0-x-heading--not-found-title-and-text";
		this.#absolutePriceSelector = ".vtex-product-price-1-x-currencyInteger";
		this.#decimalPriceSelector = ".vtex-product-price-1-x-currencyFraction";
		this.#productListItemSelector = ".vtex-search-result-3-x-galleryItem";
		this.#descriptionSelector = ".vtex-store-components-3-x-productBrand";
		this.#productUnavailableSelector = ".vtex-availability-notify-1-x-title";
	}

	async scrap() {
		await this.#navigateToSearchProductPage();

		await this.#checkProductNotExists();

		if (super.hasResult()) return this.result;

		await this.#checkProductOnList();

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
		 * Esse seletor se refere a mensagem de página não encontrada mostrada ao buscar um produto inexistente
		 */
		const productNotFound = await this.browser.pageContainsSelector(
			this.#productNotFoundSelector
		);

		if (productNotFound) {
			this.result.status = NOT_EXISTS;
		}
	}

	async #checkProductOnList() {
		/**
		 * Esse seletor se refere ao item da lista de produtos mostrados ao realizar uma busca.
		 */
		const containsProductListItem = await this.browser.pageContainsSelector(
			this.#productListItemSelector
		);
		/**
		 * Nesse momento, se a mensagem de "produto não encontrado" não foi localizada, então o produto existe na loja,
		 * porém o seletor não foi encontrado
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
		/**
		 * O preço do produto é divido em dois elementos, um com a parte inteira e outro com
		 * a parte decimal
		 */
		const containsAbsPriceSelector = await this.browser.pageContainsSelector(
			this.#absolutePriceSelector
		);
		const containsDecimalPriceSelector =
			await this.browser.pageContainsSelector(this.#decimalPriceSelector);

		/**
		 * Uma vez que foi possível chegar até a página do produto,
		 * é certo que o produto existe na loja, porém o seletor referente ao preço não foi encontrado
		 */
		if (!containsAbsPriceSelector) {
			this.result.status = INVALID_SELECTOR;
			this.result.selector = this.#absolutePriceSelector;
      return;
		}

		if (!containsDecimalPriceSelector) {
			this.result.status = INVALID_SELECTOR;
			this.result.selector = this.#decimalPriceSelector;
      return;
		}

		const containsDescription = await this.browser.pageContainsSelector(
			this.#descriptionSelector
		);

		const description = containsDescription
			? await this.browser.getPageInnerText(this.#descriptionSelector)
			: "Description not found";

		const absPriceText = await this.browser.getPageInnerText(
			this.#absolutePriceSelector
		);

		const decimalPriceText = await this.browser.getPageInnerText(
			this.#decimalPriceSelector
		);
		const price = parsePriceTextToDouble(`${absPriceText},${decimalPriceText}`);

		this.result = {
			...this.result,
			description,
			status: AVAILABLE,
			price,
		};
	}
}

module.exports = ChatubaScraper;
