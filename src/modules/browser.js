const utils = require("./../lib/utils");
const { MIME_TEXT_CSS, QUOTED_PRINTABLE, HTML_IMAGE_REGX, MK_DASH, MK_POINT, BLANK, AT_MHTML_BLINK } = require("./../lib/constants");

const getStyles = (options) => {
	const styles = document.getElementsByTagName("style");
	const symbol = options.style.symbol || BLANK;
	const output = [];

	for (const { innerText } of styles) {
		try {
			// 这里是希望不载入太多的 css 属性，所以设置了 symbol 作为是否含有该字符串的判断
			// 比如如果使用了某些库，则可以使用 symbol 
			if (utils.checkObjectIsNotEmpty(innerText) && innerText.indexOf(symbol) >= 0) {
				let random = (Math.random()).toString();
				random = random.replace(MK_POINT, MK_DASH);

				output.push({
					contentType: MIME_TEXT_CSS,
					contentTransferEncoding: QUOTED_PRINTABLE,
					contentLocation: `cid:css-${Date.now()}-${random}${AT_MHTML_BLINK}`,
					value: innerText
				})
			}
		}catch (err) {
			console.log(err);
		}
	}

	return output;
}

const getFilesBase64 = async (html) => {
	const arr = [];

	while ((matched = html.match(HTML_IMAGE_REGX)) !== null) {
		let [ proto, src ] = matched;

		/**
		 * http(s)://abac.com/a.jpg 不处理
		 * //abac.com/a.jpg => 不处理
		 * abac.com/a.jpg 不处理
		 * /abc/a.jpg => 当前网网站的地址（http://abc.com） + /abc/a.jpg
		 * ../abc/a.jpg => 当前网页的路径（http://abc.com/a/b/） + ../abc/a.jpg
		 */
		if (src.indexOf("/") === 0 && src.indexOf("//") !== 0) {
			src = document.location.origin + src;
		}
		if (src.indexOf(".") === 0) {
			src = document.location.href + src;
		}

		const promise = new Promise((resolve, reject) => {
			fetch(src).then(async response => {
				if (response.ok) {
					const blob = await response.blob();
					const reader = new FileReader();
					reader.readAsDataURL(blob);
					reader.onload = function (e) {
						// data:image/png;base64,iVBORw0KGgo...
						const { result } = e.target;
						const first = result.slice(5, 21).split(";");
						const base64Val = result.slice(22);
						resolve({contentLocation: src, value: base64Val, contentType: first[0], contentTransferEncoding: first[1]});
					}
				} else {
					resolve({}); // 如果获取文件失败,则返回一个空对象，至少让程序不中途崩溃
				}
			});
		});

		arr.push(promise);
		html = html.replace(matched[0], BLANK);
	}

	const output = await Promise.all(arr);
	return output;
}

const write = (output, { fileName }) => {
	const urlObject = window.URL || window.webkitURL || window;
	const myFile = new Blob([output]);
	var saveLink = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
	saveLink.href = urlObject.createObjectURL(myFile);
	saveLink.download = `${fileName}.mhtml`;

	const ev = document.createEvent("MouseEvents");
	ev.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	saveLink.dispatchEvent(ev);
}

module.exports = exports = {
	getStyles,
	getFilesBase64,
	write
}
