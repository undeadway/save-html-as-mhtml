const fs = require("fs");
const instance = require("./../src/index");

const options = {
	fileName: "测试输出",
	outputDir: "E:\\mine\\save-html-as-mhtml\\output",
	style: {
		filePath: "./test/input.html/hiton.css"
	}
};

const html = fs.readFileSync("./test/input.html", "utf-8");

instance(html, options);