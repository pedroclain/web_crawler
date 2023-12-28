const { TelhanorteScraper, ObramaxScraper, ChatubaScraper, LeorymerlinScraper } = require("./impl");

class CustomScraperBuilder {
	build(name) {
		switch (name) {
			case "telhanorte":
				return new TelhanorteScraper();
      case "obramax":
          return new ObramaxScraper();
      case "chatuba":
          return new ChatubaScraper();
      case "leroymerlin":
          return new LeorymerlinScraper();
			default:
				throw Error(`Store implementation for '${name}' not found.`);
		}
	}
}

module.exports = CustomScraperBuilder;
