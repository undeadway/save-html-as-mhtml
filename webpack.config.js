const path = require("path");

module.exports = {
	entry: { "save-html-as-mhtml": "./src/dns.js" },
	output: {
		path:path.resolve(__dirname ,"dist"),
		filename:"[name].js"
	},
	mode:"development"
};

