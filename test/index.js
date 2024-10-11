const fs = require("fs");
const instance = require("./../src/index");

const options = {
	fileName: "测试输出",
	outputDir: "E:\\mine\\save-html-as-mhtml\\output",
	style: {
		filePath: "E:\\mine\\hiton\\demo\\hiton.css"
	}
};

const html = fs.readFileSync("E:\\mine\\hiton\\test\\output.html", "utf-8");

instance(html, options);