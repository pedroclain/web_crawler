class CustomScraper {
  barCode;
  browser;
  result;

  init(
    browser
  ) {
    this.browser = browser;
  }

  setBarCode(barCode) {
    this.barCode = barCode;
    this.result = {
      barCode,
      status: undefined,
      selector: undefined,
      description: undefined
    }
  }

  async scrap() {
    throw Error("Trying run abstract method");
  }

  hasResult() {
    return this.result.status !== undefined;
  }
}

module.exports = CustomScraper;