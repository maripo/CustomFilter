var Util = {};
Util.regExpAmp = new RegExp('&','g'); // &amp;
Util.regExpLt = new RegExp('<','g'); // &lt;
Util.regExpGt = new RegExp('>','g'); // &gt;
Util.escapeHTML = function (str)
{
	return str
	.replace(Util.regExpAmp,'&amp;')
	.replace(Util.regExpGt, '&gt;')
	.replace(Util.regExpLt, '&lt');
};

Util.getElementsByXPath = function (xpath)
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
	catch (e) 
	{
	}
	return list;
};

Util.shorten = function (text, limit)
 {
 	if (text.length<limit) return text;
	return text.substring(0, limit) + '...';
 };
