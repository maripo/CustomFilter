var CustomBlockerUtil = {};
var KEY_CODE_RETURN = 13;
CustomBlockerUtil.regExpAmp = new RegExp('&','g'); // &amp;
CustomBlockerUtil.regExpLt = new RegExp('<','g'); // &lt;
CustomBlockerUtil.regExpGt = new RegExp('>','g'); // &gt;
CustomBlockerUtil.escapeHTML = function (str)
{
	return str
	.replace(CustomBlockerUtil.regExpAmp,'&amp;')
	.replace(CustomBlockerUtil.regExpGt, '&gt;')
	.replace(CustomBlockerUtil.regExpLt, '&lt');
};

CustomBlockerUtil.getElementsByXPath = function (xpath)
{
	var list = new Array();
	
	try
	{
		var result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
		var node;
		while (node = result.iterateNext()) 
		{
			list.push(node);
		}
	}
	catch (ex)
	{
		console.log(ex);
	}
	return list;
};
CustomBlockerUtil.getElementsByCssSelector = function (selector)
{
	try
	{
		var list = document.querySelectorAll(selector);
		return (list)?list:new Array();
	}
	catch (ex)
	{
		return new Array();
	}
};
/**
 * Example: http://*.maripo.org/q=* -> http://*.maripo.org/q=*
 */
var REGEX_WILDCARD_TO_REGEXP = new RegExp('([^A-Za-z0-9_\\*])', 'g');
var REGEX_WILDCARD = new RegExp('\\*', 'g');
CustomBlockerUtil.wildcardToRegExp = function (str) {
	var result = ".*"+str.replace(REGEX_WILDCARD_TO_REGEXP, function(){return '\\' + RegExp.$1}).replace(REGEX_WILDCARD, '.*')+".*";
	console.log(result);
	return result;
};
var REGEX_DOUBLE_SLASH = new RegExp('//','g');
var REGEX_SLASH = new RegExp('/','g');
var REGEX_SINGLE_CLASS_NAME = new RegExp('\\[@class=[\'\"](.*?)[\'\"]\\]', 'g');
var REGEX_MULTIPLE_CLASS_NAME = new RegExp('\\[contains\\(concat\\([\'\"] [\'\"],normalize-space\\(@class\\),[\'\"] [\'\"]\\),[\'\"](.*?)[\'\"]\\)\\]', 'g');
var REGEX_ID = new RegExp('id\\([\'\"](.*?)[\'\"]\\)', 'g');
var REGEX_FAIL = new RegExp('.*[\\[\\]\\(\\)\"\'].*');
CustomBlockerUtil.xpathToCss = function (str)
{
	var xpath = str;
	xpath = xpath.replace(REGEX_ID, "#$1");
	xpath = xpath.replace(REGEX_SINGLE_CLASS_NAME, ".$1");
	xpath = xpath.replace(REGEX_MULTIPLE_CLASS_NAME, ".$1");
	xpath = xpath.replace(REGEX_DOUBLE_SLASH, ' ');
	xpath = xpath.replace(REGEX_SLASH, '>');
	if (REGEX_FAIL.test(xpath)) return null;
	return xpath;
}

CustomBlockerUtil.WIDTH_PER_LETTER = 10;
CustomBlockerUtil.shorten = function (text, limit)
 {
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
 };
 
CustomBlockerUtil.getRelativeElementsByXPath = function(targetNode, xpath)
{
	var list = new Array();
	try 
	{
		var result = document.evaluate(xpath, targetNode, null, XPathResult.ANY_TYPE, null);
		var node;
		
		while (node = result.iterateNext()) 
		{
			list.push(node);
		}
	} 
	catch (e) 
	{
		console.log(e)
	}
	return list;
};

CustomBlockerUtil.getRuleDetailTip = function (rule)
{
	if (rule.block_anyway)
		return chrome.i18n.getMessage('blockAnyway');
	if (null==rule.words || 0==rule.words.length)
		return null;
	var wordStrings = new Array();
	for (var i=0, l=rule.words.length; i<l; i++)
	{
		wordStrings.push(rule.words[i].word);
	}
	return wordStrings.join(', ');
};
CustomBlockerUtil.arrayEquals = function (array0, array1)
{
	if (!array0 || !array1 || array0.length!=array1.length) 
	{
		return false;
	}
	for (var i=0, l=array0.length; i<l; i++)
	{
		if (array0[i] != array1[i])
			return false;
	}
	return true;
};
CustomBlockerUtil.arrayContains = function (array, str) 
{
	for (var i=0, l=array.length; i<l; i++) 
	{
		if (str==array[i]) return true;
	}
	return false;
};

CustomBlockerUtil.isEmpty = function (str) 
{
	return (null==str || ''==str);
};

CustomBlockerUtil.notEmpty = function (str)
{
	return !CustomBlockerUtil.isEmpty(str);
}
CustomBlockerUtil.LOCALIZE_CLASS_REGEXP = new RegExp('custom_filter_localize_([^ ]+)');
CustomBlockerUtil.localize = function ()
{
	var tags = [];
	CustomBlockerUtil.addAll(tags, document.getElementsByTagName('SPAN'));
	CustomBlockerUtil.addAll(tags, document.getElementsByTagName('LABEL'));
	
	var buttons = document.getElementsByTagName('INPUT');
	for (var i=0, l=tags.length; i<l; i++)
	{
		var element = tags[i];
		if (null!=element.className && element.className.match(CustomBlockerUtil.LOCALIZE_CLASS_REGEXP))
		{
			var key = RegExp.$1;
			if (!!chrome.i18n.getMessage(key)) {
				Log.v("CustomBlockerUtil.localize " + element.innerHTML + "->" + chrome.i18n.getMessage(key));
				element.innerHTML = chrome.i18n.getMessage(key);
			} else {
				Log.e("Missing localization key: " + key + ", className=" + element.className);
			}
		}
	}
	for (var i=0, l=buttons.length; i<l; i++)
	{
		var element = buttons[i];
		if ('button'!=element.type) continue;
		if (null!=element.className && element.className.match(CustomBlockerUtil.LOCALIZE_CLASS_REGEXP))
		{
			var key = RegExp.$1;
			if (!!chrome.i18n.getMessage(key)) {
				element.value = chrome.i18n.getMessage(key);
			} else {
				Log.v("CustomBlockerUtil.localize " + element.value + "->" + chrome.i18n.getMessage(key));
			}
		}
	}
};
CustomBlockerUtil.addAll = function (array, elementsToAdd)
{
	for (var i=0; i<elementsToAdd.length; i++)
		array.push(elementsToAdd[i]);
}
CustomBlockerUtil.REGEX_FILE_NAME = new RegExp('/([a-zA-Z0-9_]+\.html)$');
CustomBlockerUtil.getShowHelpAction = function (_fileName)
{
	CustomBlockerUtil.REGEX_FILE_NAME.test(_fileName);
	var fileName = RegExp.$1;
	return function (event) 
	{
		CustomBlockerUtil.showHelp(fileName);
	}
}
CustomBlockerUtil.showHelp = function (fileName)
{
	console.log("CustomBlockerUtil.showHelp fileName=" + fileName);
	window.open(chrome.extension.getURL('/help/'+ chrome.i18n.getMessage('extLocale') + '/' +fileName),
			"help","top=10,left=10,width=480 height=500 resizable=yes menubar=no, toolbar=no");
};
CustomBlockerUtil.trim = function (str)
{
	return str.replace(/^[\s　]+|[\s　]+$/g, '');
};

CustomBlockerUtil.CSS_CLASS = "customblocker-css";
CustomBlockerUtil.applyCss = function (path) 
{
	// Check duplication
	var existingLinks = document.getElementsByTagName('LINK');
	for (var i=0, l=existingLinks.length; i<l; i++)
	{
		var existingLink = existingLinks[i];
		if (CustomBlockerUtil.CSS_CLASS==existingLink.className && existingLink.href.indexOf(path)>0)
			return;
	}
	// Create Link Element
	var cssNode = document.createElement('LINK');
	cssNode.rel = "stylesheet";
	cssNode.className = CustomBlockerUtil.CSS_CLASS;
	cssNode.href = chrome.extension.getURL(path);
	document.getElementsByTagName('HEAD')[0].appendChild(cssNode);
};

CustomBlockerUtil.removeCss = function (path) 
{
	var existingLinks = document.getElementsByTagName('LINK');
	for (var i=0, l=existingLinks.length; i<l; i++)
	{
		var existingLink = existingLinks[i];
		if (CustomBlockerUtil.CSS_CLASS==existingLink.className && existingLink.href.indexOf(path)>0)
		{
			existingLink.parentNode.removeChild(existingLink);
			return;
		}
	}
};

/**
 * Return true if targetNode is contained in or equal to ancestorNode
 */
CustomBlockerUtil.isContained = function (targetNode, ancestorNode)
{
	if (!ancestorNode || !targetNode) return false;
	var node = targetNode;
	while (node && document.body!=node) 
	{
		if (node == ancestorNode) return true;
		node = node.parentNode;
	}
	return false;
};
/**
 * Return an element which contains all elements
 */
CustomBlockerUtil.getCommonAncestor = function (elements) 
{
	var element = elements[0];
	while (element && document.body!=element)
	{
		var containsAll = true;
		for (var i=1; i<elements.length; i++)
		{
			if (!CustomBlockerUtil.isContained(elements[i], element))
				containsAll = false;
		}
		if (containsAll) return element;
		element = element.parentNode; 
	}
	return document.body;
};

CustomBlockerUtil.clearChildren = function (element)
{
	while (element.childNodes.length > 0)
	{
		element.removeChild(element.childNodes[element.childNodes.length-1]);
	}
};
/**
 * Return list of siblings with same tag name
 */
CustomBlockerUtil.getSimilarSiblings = function (element)
{
	var parent = element.parentNode;
	if (!parent) return new Array();
	var similarSiblings = new Array();
	var siblings = parent.childNodes;
	for (var i=0, l=siblings.length; i<l; i++)
	{
		if (siblings[i].tagName == element.tagName && siblings[i] != element)
			similarSiblings.push(siblings[i]);
	}
	return similarSiblings;
};

CustomBlockerUtil.getContainedElements = function (ancestorElements, elements)
{
	var containedElements = new Array();
	for (var index=0; index<elements.length; index++)
	{
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
};
CustomBlockerUtil.getSuggestedSiteRegexp = function ()
{
	var str = location.href.replace(new RegExp('http(s|)://'),'');
	var metaChars = new RegExp('[\\\\^\\.\\$\\*\\?\\|\\(\\)\\[\\]\\{\\}]','g');
	str = str.replace(metaChars, function (a,b){return '\\'+a});
	return str;
};

CustomBlockerUtil.createWordElement = function (word, deleteCallback /* function(span) */)
{
	var span = CustomBlockerUtil.createSimpleWordElement(word);
	var deleteButton = CustomBlockerUtil.createDeleteButton();
	deleteButton.addEventListener('click', function(){deleteCallback(span)}, true);
	span.appendChild(deleteButton);
	
	return span;
};
/* Create [x] button (without function) */
CustomBlockerUtil.createDeleteButton = function () {
	var span = document.createElement('SPAN');
	var button = document.createElement('INPUT');
	button.avoidStyle = true;
	button.className = 'deleteButton';
	button.type = 'button';
	button.href = 'javascript:void(0)';
	return button;
};
CustomBlockerUtil.createSimpleWordElement = function (word)
{
	var span = document.createElement('SPAN');
	span.innerHTML = word.word;
	span.className = 'word ' + ((word.is_regexp)?'regexp':'not_regexp');
	span.avoidStyle = true;
	return span;

};
CustomBlockerUtil.enableFlashZIndex = function ()
{
	var embeds = document.getElementsByTagName('EMBED');
	for (var i=0, l=embeds.length; i<l; i++)
	{
		var embed = embeds[i];
		embed.setAttribute('wmode', 'transparent');
		var param = document.createElement('PARAM');
		param.name = 'wmode';
		param.value = 'transparent';
		if ('OBJECT'==embed.parentNode.tagName)
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
};


var Log = {};
Log.Level =
{
		VERBOSE: 1,
		DEBUG: 2,
		INFO: 3,
		WARNING: 4,
		ERROR: 5
};
Log.FILTER_LEVEL = Log.Level.WARNING;

Log._write = function (message, level, label)
{
	if (level >= Log.FILTER_LEVEL)
	{
		console.log ("[Blocker]\t" + "[" + label + "]\t" + new Date() + "\t" + message);
	}
}
Log.v = function (message) { Log._write(message, Log.Level.VERBOSE, "v"); };
Log.d = function (message) { Log._write(message, Log.Level.DEBUG, "d"); };
Log.i = function (message) { Log._write(message, Log.Level.INFO, "i"); };
Log.w = function (message) { Log._write(message, Log.Level.WARNING, "w"); };
Log.e = function (message) { Log._write(message, Log.Level.ERROR, "e"); };
