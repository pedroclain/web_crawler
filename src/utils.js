const parsePriceTextToDouble = (text) => {
	try {
		return Number.parseFloat(
			text
				.replace(/[^\d,]/g, "")
				.replace(".", "")
				.replace(",", ".")
		);
	} catch (err) {
		console.error("Fail to parse text price to double. Returning text value");
		return text;
	}
};

module.exports = {
	parsePriceTextToDouble,
};
