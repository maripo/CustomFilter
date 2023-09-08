const KEY_CODE_RETURN = 13;

/**
 * Example: http://*.maripo.org/q=* -> http://*.maripo.org/q=*
 */
const REGEX_WILDCARD_TO_REGEXP = new RegExp('([^A-Za-z0-9_\\*])', 'g');
const REGEX_WILDCARD = new RegExp('\\*', 'g');
const REGEX_DOUBLE_SLASH = new RegExp('//','g');
const REGEX_SLASH = new RegExp('/','g');
const REGEX_SINGLE_CLASS_NAME = new RegExp('\\[@class=[\'\"](.*?)[\'\"]\\]', 'g');
const REGEX_MULTIPLE_CLASS_NAME = new RegExp('\\[contains\\(concat\\([\'\"] [\'\"],normalize-space\\(@class\\),[\'\"] [\'\"]\\),[\'\"](.*?)[\'\"]\\)\\]', 'g');
const REGEX_ID = new RegExp('id\\([\'\"](.*?)[\'\"]\\)', 'g');
const REGEX_FAIL = new RegExp('.*[\\[\\]\\(\\)\"\'].*');

class CustomBlockerUtil {
	static regExpAmp: RegExp;
	static regExpLt: RegExp;
	static regExpGt: RegExp;
	static WIDTH_PER_LETTER:number;
	static LOCALIZE_CLASS_REGEXP:RegExp;
	static REGEX_FILE_NAME:RegExp;
	static CSS_CLASS:string;
	public static initialize () {
		CustomBlockerUtil.regExpAmp = new RegExp('&','g'); // &amp;
		CustomBlockerUtil.regExpLt = new RegExp('<','g'); // &lt;
		CustomBlockerUtil.regExpGt = new RegExp('>','g'); // &gt;
		CustomBlockerUtil.WIDTH_PER_LETTER = 10;
		CustomBlockerUtil.LOCALIZE_CLASS_REGEXP = new RegExp('custom_filter_localize_([^ ]+)');
		CustomBlockerUtil.REGEX_FILE_NAME = new RegExp('/([a-zA-Z0-9_]+\.html)$');
		CustomBlockerUtil.CSS_CLASS = "customblocker-css";

	}
	public static escapeHTML (str:string) {
		return str
		.replace(CustomBlockerUtil.regExpAmp,'&amp;')
		.replace(CustomBlockerUtil.regExpGt, '&gt;')
		.replace(CustomBlockerUtil.regExpLt, '&lt');
	}
	public static getElementsByXPath (xpath:string) : any[] {
		let list = new Array();
		try {
			var result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
			var node;
			while (node = result.iterateNext()) {
				list.push(node);
			}
		}
		catch (ex) {
			console.log(ex);
		}
		return list;
	}
	public static getElementsByCssSelector (selector) : any[] {
		try {
			var list = document.querySelectorAll(selector);
			return (list)?list:new Array();
		} catch (ex) {
			return new Array();
		}
	}
	public static wildcardToRegExp (str:string): string {
		var result = ".*"
			+ str.replace(REGEX_WILDCARD_TO_REGEXP, '\\$1').replace(REGEX_WILDCARD, '.*')
			+ ".*";
		return result;
	}
	public static xpathToCss (str:string):string {
		let xpath = str;
		xpath = xpath.replace(REGEX_ID, "#$1");
		xpath = xpath.replace(REGEX_SINGLE_CLASS_NAME, ".$1");
		xpath = xpath.replace(REGEX_MULTIPLE_CLASS_NAME, ".$1");
		xpath = xpath.replace(REGEX_DOUBLE_SLASH, ' ');
		xpath = xpath.replace(REGEX_SLASH, '>');
		if (REGEX_FAIL.test(xpath)) return null;
		return xpath;
	}
	public static shorten (text:string, limit:number) {
		var span = document.createElement('SPAN');
		span.style.fontSize = (CustomBlockerUtil.WIDTH_PER_LETTER*2) + 'px';
		var resultText = text;
		document.body.appendChild(span);
		span.innerHTML = CustomBlockerUtil.escapeHTML(resultText);
		if (span.offsetWidth > limit * CustomBlockerUtil.WIDTH_PER_LETTER)
		{
			//Shorten
			for (var length = text.length; length>0; length--)
			{
				var str = text.substring(0, length) + '...';
				span.innerHTML = span.innerHTML = CustomBlockerUtil.escapeHTML(str);
				if (span.offsetWidth <= limit*CustomBlockerUtil.WIDTH_PER_LETTER)
				{
					resultText = str;
					break;
				}
			}
		}
	 	document.body.removeChild(span);
	 	return resultText;
	 }
	 public static getRelativeElementsByXPath (targetNode:HTMLElement, xpath:string) {
		var list = new Array();
		try
		{
			var result = document.evaluate(xpath, targetNode, null, XPathResult.ANY_TYPE, null);
			var node;

			while (node = result.iterateNext()) {
				list.push(node);
			}
		}
		catch (e) {
			console.log(e)
		}
		return list;
	}

	// TODO move to Rule class
	public static getRuleDetailTip (rule:Rule): string {
		if (rule.block_anyway)
			return chrome.i18n.getMessage('blockAnyway');
		if (null==rule.words || rule.words.length == 0)
			return null;
		let lines = new Array();
		let wordStrings = new Array();
		const getWordTip = (word, map) => {
			if (map && map[word.word_id] > 0) {
				return word.word + ("(" + map[word.word_id]+")")
			}
			return word.word;
		};
		for (let word of rule.words) {
			wordStrings.push(getWordTip(word, rule.appliedWordsMap));
		}
		lines.push(wordStrings.join(', '));
		for (let group of rule.wordGroups) {
			let str = "[" + group.name +"]"
			+ group.words.map((word)=>{return getWordTip(word, rule.appliedWordsMap)}).join(",");
			lines.push(str);
		}
		return lines.join(" / ");
	}
	public static arrayEquals (array0:any[], array1:any[]): boolean {
		if (!array0 || !array1 || array0.length!=array1.length) {
			return false;
		}
		for (var i=0, l=array0.length; i<l; i++) {
			if (array0[i] != array1[i])
				return false;
		}
		return true;
	}
	public static arrayContains (array:any[], obj:any):boolean {
		for (let objInArray of array) {
			if (obj==objInArray) return true;
		}
		return false;
	}
	public static isEmpty (str:string): boolean {
		return (null==str || ''==str);
	}
	// TODO remove
	public static notEmpty (str:string): boolean {
		return !CustomBlockerUtil.isEmpty(str);
	}
	public static getShowHelpAction (_fileName:string) : (any)=>any {
		CustomBlockerUtil.REGEX_FILE_NAME.test(_fileName);
		var fileName = RegExp.$1;
		return function (event) {
			CustomBlockerUtil.showHelp(fileName);
		}
	}
	public static addAll (array, elementsToAdd:any) {
		for (var i=0; i<elementsToAdd.length; i++) {
			(array as any[]).push(elementsToAdd[i]);
		}
	}
	public static processPage () {
		let tags = [];
		CustomBlockerUtil.addAll(tags, document.getElementsByTagName('SPAN'));
		CustomBlockerUtil.addAll(tags, document.getElementsByTagName('LABEL'));
		CustomBlockerUtil.addAll(tags, document.getElementsByTagName('A'));

		let buttons = document.getElementsByTagName('INPUT');
		for (var i=0, l=tags.length; i<l; i++) {
			let element = tags[i];
			if (null!=element.className && element.className.match(CustomBlockerUtil.LOCALIZE_CLASS_REGEXP))
			{
				var key = RegExp.$1;
				if (!!chrome.i18n.getMessage(key)) {
					Log.v("CustomBlockerUtil.processPage " + element.innerHTML + "->" + chrome.i18n.getMessage(key));
					element.innerHTML = chrome.i18n.getMessage(key);
				} else {
					Log.e("Missing localization key: " + key + ", className=" + element.className);
				}
			}
		}
		for (var i=0, l=buttons.length; i<l; i++) {
			let element = buttons[i];
			if ('button'!=element.getAttribute("type")) continue;
			if (null!=element.className && element.className.match(CustomBlockerUtil.LOCALIZE_CLASS_REGEXP))
			{
				var key = RegExp.$1;
				if (!!chrome.i18n.getMessage(key)) {
					element.setAttribute("value", chrome.i18n.getMessage(key));
				} else {
					Log.v("CustomBlockerUtil.processPage " + element.getAttribute("value") + "->" + chrome.i18n.getMessage(key));
				}
			}
		}
		let keyPrefix = "customblocker_note_";
		let notes = document.querySelectorAll<HTMLElement>(".note--dismissable");
		if (notes) {
			for (let i=0; i<notes.length; i++) {
				let note = notes[i];
				let noteKey = keyPrefix + note.getAttribute("note_key");
				if (localStorage[noteKey]=="true") {
					// Already dismissed.
					continue;
				}
				note.style.display = "block";
				let links = note.getElementsByTagName("a");
				for (let j=0; j<links.length; j++) {
					let link = links[j];
					if (link.className.indexOf("note__dismiss") >= 0) {
						link.addEventListener("click", ()=>{
							note.style.display = "none";
							localStorage[noteKey] = "true";
						});
					}
				}
			}

		}
	}
	public static showHelp (fileName: string) {
		window.open(chrome.extension.getURL('/help/'+ chrome.i18n.getMessage('extLocale') + '/' +fileName),
				"help","top=10,left=10,width=480 height=500 resizable=yes menubar=no, toolbar=no");
	}
	public static trim (str: string) {
		return str.replace(/^[\s　]+|[\s　]+$/g, '');
	}
	public static applyCss = function (path:string)  {
		// Check duplication
		var existingLinks = document.getElementsByTagName('LINK');
		for (var i=0, l=existingLinks.length; i<l; i++)
		{
			var existingLink = existingLinks[i];
			if (CustomBlockerUtil.CSS_CLASS==existingLink.className && existingLink.getAttribute("href").indexOf(path)>0)
				return;
		}
		// Create Link Element
		var cssNode = document.createElement('LINK');
		cssNode.setAttribute("href", chrome.extension.getURL(path));
		cssNode.setAttribute("rel", "stylesheet");
		cssNode.className = CustomBlockerUtil.CSS_CLASS;
		document.getElementsByTagName('HEAD')[0].appendChild(cssNode);
	}
	public static createKeywordOptionIcon (fileName:string, suffix:string, tip:string) : any /* TODO Image tag */ {
		var img = document.createElement("IMG");
		img.title = chrome.i18n.getMessage(tip);
		img.setAttribute("src", chrome.extension.getURL("img/" + fileName + "_" + suffix + ".png"));
		img.className = "option";
		return img;
	}
	public static removeCss (path:string) {
		var existingLinks = document.getElementsByTagName('LINK');
		for (var i=0, l=existingLinks.length; i<l; i++)
		{
			var existingLink = existingLinks[i];
			if (CustomBlockerUtil.CSS_CLASS==existingLink.className && (existingLink.getAttribute("href")).indexOf(path)>0) {
				existingLink.parentNode.removeChild(existingLink);
				return;
			}
		}
	}
	/**
	 * Return true if targetNode is contained in or equal to ancestorNode
	 * TODO rename
	 */
	public static isContained (targetNode:HTMLElement, ancestorNode:HTMLElement): boolean {
		if (!ancestorNode || !targetNode) return false;
		var node = targetNode;
		while (node && document.body!=node)
		{
			if (node == ancestorNode) return true;
			node = <HTMLElement>node.parentNode;
		}
		return false;
	}
	/**
	 * Return an element which contains all elements
	 */
	public static getCommonAncestor (elements:HTMLElement[]):HTMLElement {
		var element = elements[0];
		while (element && document.body!=element) {
			var containsAll = true;
			for (var i=1; i<elements.length; i++) {
				if (!CustomBlockerUtil.isContained(elements[i], element))
					containsAll = false;
			}
			if (containsAll) return element;
			element = <HTMLElement>element.parentNode;
		}
		return document.body;
	}
	/**
		Remove all child nodes (TODO rename)
	*/
	public static clearChildren (element) {
		while (element.childNodes.length > 0) {
			element.removeChild(element.childNodes[element.childNodes.length-1]);
		}
	}
	/**
	 * Return list of siblings with same tag name
	 */
	public static getSimilarSiblings (element: HTMLElement): HTMLElement[] {
		var parent = element.parentNode;
		if (!parent) {
			return [];
		}
		let similarSiblings:HTMLElement[] = [];
		var siblings = parent.childNodes;
		for (var i=0, l=siblings.length; i<l; i++) {
			if ((siblings[i] as HTMLElement).tagName == element.tagName && siblings[i] != element)
				similarSiblings.push(siblings[i] as HTMLElement);
		}
		return similarSiblings;
	}
	// TODO rename
	public static getContainedElements (ancestorElements, elements) {
		var containedElements = new Array();
		for (var index=0; index<elements.length; index++) {
			var element = elements[index];
			for (var ancestorIndex=0; ancestorIndex<ancestorElements.length; ancestorIndex++)
			{
				if (CustomBlockerUtil.isContained (element, ancestorElements[ancestorIndex]))
				{
					containedElements.push(element);
					break;
				}
			}
		}
		return containedElements;
	}
	public static getSuggestedSiteRegexp (): string {
		var str = location.href.replace(new RegExp('http(s|)://'),'');
		var metaChars = new RegExp('[\\\\^\\.\\$\\*\\?\\|\\(\\)\\[\\]\\{\\}]','g');
		str = str.replace(metaChars, function (a,b){return '\\'+a});
		return str;
	}
	// TODO move
	public static createWordElement (word, deleteCallback /* function(span) */) {
		var span = CustomBlockerUtil.createSimpleWordElement(word);
		var deleteButton = CustomBlockerUtil.createDeleteButton();
		deleteButton.addEventListener('click', function(){deleteCallback(span)}, true);
		span.appendChild(deleteButton);

		return span;
	}
	public static createWordGroupElement (group, deleteCallback /* function(span) */) {
		let span = document.createElement("SPAN");
		span.className = "group";
		span.innerHTML = group.name;
		let deleteButton = CustomBlockerUtil.createDeleteButton();
		if (group.words.length > 0) {
			span.title = group.words.map(word => word.word).join(",");
		}
		deleteButton.addEventListener('click', deleteCallback, true);
		span.appendChild(deleteButton);
		return span;
	}

	/* Create [x] button (without function) */
	public static createDeleteButton = function () {
		var span = document.createElement('SPAN');
		var button = document.createElement('INPUT');
		button.setAttribute("avoidStyle", "true");
		button.className = 'word__delete-button';
		button.setAttribute("typte", "button");
		button.setAttribute("href", 'javascript:void(0)');
		return button;
	}

	public static createSimpleWordElement (word) {
		var span = document.createElement('SPAN');
		var suffix = word.is_complete_matching? 'red':'blue';
		if (word.is_regexp) {
			span.appendChild(CustomBlockerUtil.createKeywordOptionIcon("keyword_regexp",suffix,"regex"));
		}
		if (word.is_case_sensitive) {
			span.appendChild(CustomBlockerUtil.createKeywordOptionIcon("keyword_case_sensitive",suffix,"case_sensitive"));
		}
		if (word.is_include_href) {
			span.appendChild(CustomBlockerUtil.createKeywordOptionIcon("keyword_include_href",suffix,"include_href"));
		}
		span.innerHTML += word.word;
		span.className = 'word word--'
			+ ((word.is_complete_matching)?'complete-matching':'not-complete-matching');
		span.setAttribute("avoidStyle", "true");
		return span;
	}
	public static enableFlashZIndex  ()
	{
		var embeds = document.getElementsByTagName('EMBED');
		for (var i=0, l=embeds.length; i<l; i++)
		{
			var embed = embeds[i];
			embed.setAttribute('wmode', 'transparent');
			var param = document.createElement('PARAM');
			param.setAttribute('name', 'wmode');
			param.setAttribute('value', 'transparent');
			if ('OBJECT'==(embed.parentNode as HTMLElement).tagName)
			{
				embed.parentNode.appendChild(param);
			}
			else
			{
				// Wrap <embed> element with <object> element
				var object = document.createElement('OBJECT');
				object.appendChild(param);
				embed.parentNode.appendChild(object);
				object.appendChild(embed);
			}
		}
	}
}
CustomBlockerUtil.initialize();
// TODO reove
class Log {
	// TODO replace with enum
	static VERBOSE:number;
	static DEBUG:number;
	static INFO:number;
	static WARNING:number;
	static ERROR:number;
	static FILTER_LEVEL:number;
	public static initialize () {
		Log.VERBOSE = 1;
		Log.DEBUG = 2;
		Log.INFO = 3;
		Log.WARNING = 4;
		Log.ERROR = 5;
		Log.FILTER_LEVEL = Log.WARNING;
	}
	public static _write = function (message:string, level:number, label:string) {
		if (level >= Log.FILTER_LEVEL) {
			console.log ("[Blocker]\t" + "[" + label + "]\t" + new Date() + "\t" + message);
		}
	}
	public static v (message:string) { Log._write(message, Log.VERBOSE, "v"); }
	public static d (message:string) { Log._write(message, Log.DEBUG, "d"); }
	public static i (message:string) { Log._write(message, Log.INFO, "i"); }
	public static w (message:string) { Log._write(message, Log.WARNING, "w"); }
	public static e (message:string) { Log._write(message, Log.ERROR, "e"); }
}
Log.initialize();
