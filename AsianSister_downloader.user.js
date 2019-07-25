// ==UserScript==
// @name       AsianSister downloader
// @version    1.0
// @match      *://asiansister.com/view_*
// @require    https://cdnjs.cloudflare.com/ajax/libs/jszip/3.2.2/jszip.min.js
// @require    https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.8/FileSaver.min.js
// @require    https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @grant      none
// ==/UserScript==

const title = $("h1").text().replace(/[\*\|\\\:\"\<\>\?\/]/g, "");
const imageUrls = $("img[id^='show']").map(function () {
	return this.getAttribute("dataUrl").substr(5, this.getAttribute("dataUrl").length);
}).get();

let inProcess = false;
let complates = 0;
let zipContent = null;

$(".downloadButton").parent().after($("<button/>", {
	"class": "downloadButton",
	html: "壓縮後下載",
	click: async function () {
		const btn = $(this);
		if (zipContent == null) {
			if (inProcess) return;
			inProcess = true;
			complates = 0;
			btn.html(`圖片下載中... ${complates}/${imageUrls.length}`);

			const zip = new JSZip();
			const img = zip.folder(title);
			await Promise.all(imageUrls.map(async function (url) {
				const filename = url.match(/([a-zA-Z0-9\s_\\.\-\(\):])+$/i)[0];
				const response = await fetch(new Request(url));
				const blob = response.blob();
				img.file(filename, blob);
				complates++;
				btn.html(`圖片下載中... ${complates}/${imageUrls.length}`);
			}));
			btn.html(`壓縮中...`);
			zipContent = await zip.generateAsync({ type: "blob" });
			btn.html(`壓縮完成!`);
		}
		saveAs(zipContent, title + ".zip");
	},
}));
