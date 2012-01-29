var CustomBlockerUtil = {};
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
	var result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
	var node;
	while (node = result.iterateNext()) 
	{
		list.push(node);
	}
	return list;
};
CustomBlockerUtil.getElementsByCssSelector = function (selector)
{
	try
	{
		return document.querySelectorAll(selector);
	}
	catch (ex)
	{
		return new Array();
	}
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

CustomBlockerUtil.shorten = function (text, limit)
 {
 	if (text.length<limit) return text;
	return text.substring(0, limit) + '...';
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
CustomBlockerUtil.arrayContains = function (array, str) 
{
	for (var i=0, l=array.length; i<l; i++) if (str==array[i]) return true;
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
	var elements = document.getElementsByTagName('SPAN');
	for (var i=0, l=elements.length; i<l; i++)
	{
		var element = elements[i];
		if (!element) continue;
		if (null!=element.className && element.className.match(CustomBlockerUtil.LOCALIZE_CLASS_REGEXP))
		{
			element.innerHTML = chrome.i18n.getMessage(RegExp.$1);
		}
	}
};
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