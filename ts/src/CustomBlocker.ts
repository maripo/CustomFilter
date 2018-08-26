function getCustomBlockerSrcPath (): [string, HTMLElement] {
	let scripts = document.getElementsByTagName("script");
	let rx = new RegExp("(.*\/)CustomBlocker\.js");
	for (let i=scripts.length-1; i>=0; i--) {
		let path = scripts[i].getAttribute("src");
		if (path && path.match(rx)) {
			return [RegExp.$1, scripts[i].parentElement];
		}
	}
}
(function (){
	let scriptPath = getCustomBlockerSrcPath();
	let files = [ /*"db/DbInit.js", "db/DbObj.js", "db/Rule.js", "db/Word.js",*/
		"rule/Storage.js", "rule/Rule.js", "rule/Word.js", "rule/WordGroup.js", "util.js", "uuid.js" ];
	for (let file of files) {
		let path = scriptPath[0] + file;
		let tag = document.createElement("SCRIPT");
		tag.setAttribute("src", path);
		tag.setAttribute("type", "text/javascript");
		tag.setAttribute("extension", "CustomBlocker");
		scriptPath[1].appendChild(tag);
	}
})();