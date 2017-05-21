
var RuleExecutor = 
{
	blockTimeout:null,
	blockInterval: null,
	styleTag: null,
	blockedCount: 0
};

var rules;
var hiddenNodes = new Array();

RuleExecutor.checkRules = function (list)
{
	for (var i = 0, l = list.length; i < l; i++) 
	{
		var rule = list[i];
		try 
		{
			var regex;
			if (rule.specify_url_by_regexp) 
			{
				regex = new RegExp(rule.site_regexp);
			}
			else {
				Log.v("Using wildcard...");
				regex = new RegExp(CustomBlockerUtil.wildcardToRegExp(rule.site_regexp));
			}
			if (regex.test(location.href)) 
			{
				Log.v("Rule is applied." + location.href + "<=>" + rule.site_regexp);
				rules.push(rule);
			}
			else
			{
				Log.v("Rule is NOT applied." + location.href + "<=>" + rule.site_regexp);
			}
		} 
		catch (e) 
		{
			console.log("RuleExecutor.checkRules ERROR");
			console.log(e);
		}
	}
	window.bgProcessor.sendRequest('setApplied', {list:rules}, 'badge');
	if (rules.length > 0) 
		RuleExecutor.startBlock();
};



RuleExecutor.startBlock = function()
{
	for (var i=0, l=rules.length; i<l; i++) 
	{
		var rule = rules[i];
		if (rule.block_anyway && !rule.is_disabled)
		{
			var cssSelector = (rule.hide_block_by_css)?
				rule.hide_block_css:CustomBlockerUtil.xpathToCss(rule.hide_block_xpath);
			if (cssSelector!=null)
			{
				RuleExecutor.addBlockCss(cssSelector);
				rule.staticXpath = cssSelector;
			}
		}
		for (var j=0; j< rule.words.length; j++) 
		{
			var word = rule.words[j];
			if (word.is_regexp) 
			{
				try {
					if (word.is_complete_matching) {
						// Append "^" and "$"
						var expression = (word.word.charAt(0)!='^')?"^":"";
						expression += word.word;
						expression += ((word.word.charAt(word.word.length-1)!='$')?'$':'');
						word.regExp = new RegExp(expression, 'i');
					} else {
						word.regExp = new RegExp(word.word, 'i')
					}
				} catch (ex) {
					console.log("Invalid RegExp: " + word.word);
				}
			}
		}
	}
	var needBlocking = false;
	for (var i=0, l=rules.length; i<l; i++) 
	{
		if (!rules[i].is_disabled) needBlocking = true;
	}
	if (needBlocking)
	{
		RuleExecutor.blockTimeout = setTimeout(RuleExecutor.execBlock, 50);
		RuleExecutor.blockInterval = setInterval(RuleExecutor.execBlock, 2000);
	}
};


RuleExecutor.execBlock = function ()
{
	if (!rules) return;
	for (var i = 0; i < rules.length; i++)
	{
		var rule = rules[i];
		if (!rules[i].is_disabled) 
		{
			RuleExecutor.applyRule(rules[i], false, 
				function (node) 
				{
					if (!rule.staticXpath)
					{
						node.style.display = 'none';
					}
					addToHiddenNodes(node);	
					RuleExecutor.blockedCount++;
				}
			);
		}
	}
};

RuleExecutor.reloadRules = function ()
{
	console.log("RuleExecutor.reloadRules")
	window.bgProcessor.sendRequest(
		'reload', 
		{}, 
		'reload'
	);
};


RuleExecutor.applyRule = function (rule, /* boolean */ ignoreHidden, /*function(node)*/onHide, isTesting)
{
	var needRefreshBadge = false;
	var hideNodes = (rule.hide_block_by_css)?
			CustomBlockerUtil.getElementsByCssSelector(rule.hide_block_css)
			:
			CustomBlockerUtil.getElementsByXPath(rule.hide_block_xpath);
	var searchNodes;
	if ( (rule.search_block_by_css && CustomBlockerUtil.isEmpty(rule.search_block_css)) || 
			(!rule.search_block_by_css && CustomBlockerUtil.isEmpty(rule.search_block_xpath) )) {
		searchNodes = [];
		for (var i=0; i<hideNodes.length; i++) {
			searchNodes.push(hideNodes[i]);
		}
	} else {
		searchNodes = (rule.block_anyway)?[]:(
				(rule.search_block_by_css)?
					CustomBlockerUtil.getElementsByCssSelector(rule.search_block_css)
					:
					CustomBlockerUtil.getElementsByXPath(rule.search_block_xpath)
				);
	}
	for (var i = 0, l = searchNodes.length; i < l; i++) 
	{
		var node = searchNodes[i];
		// Check keywords
		if (node.getAttribute("containsNgWord")) {
			continue;
		}
		var foundWord = RuleExecutor.nodeContains(node, rule.words);
		if (foundWord != null) {
			console.log(foundWord)
			node.containsNgWord = true;
			node.setAttribute("containsNgWord", true);
			node.setAttribute("foundWord", foundWord.word_id);
		}
	}
	for (var i = 0, l = hideNodes.length; i < l; i++) 
	{
		var node = hideNodes[i];
		if (node.style.display=="none") {
			continue;
		}
		var shouldBeHidden = rule.block_anyway;
		var foundChild = null;
		if (!shouldBeHidden) {
			foundChild = RuleExecutor.findFlaggedChild(node, searchNodes);
			if (foundChild) {
				shouldBeHidden = true;
				//console.log(foundChild)
			}
		}
		if ((ignoreHidden||!node.hideDone) && shouldBeHidden) 
		{
			if (!node.defaultStyles) 
			{
				node.defaultStyles =
				{
					backgroundColor : node.style.backgroundColor,
					display : node.style.display
				};
			}
			node.hideDone = true;
			needRefreshBadge = true;
			rule.hiddenCount = (rule.hiddenCount)?rule.hiddenCount+1:1;
			if (foundChild) {
				if (!rule.appliedWords) {
					rule.appliedWords = [];
				}
				var wordId = parseInt(foundChild.getAttribute("foundWord"));
				rule.appliedWords[wordId] = (rule.appliedWords[wordId]>0)?rule.appliedWords[wordId]+1:1;
			}
			// Exec callback
			if (onHide) {
				onHide(node);
			}
		}
		else if (isTesting && node.hideDone && !shouldBeHidden) 
		{
			if (node.defaultStyles) {
				node.style.backgroundColor = node.defaultStyles.backgroundColor;
				node.style.display = node.defaultStyles.display;
			}
		}
	}
	for (var i = 0, l = searchNodes.length; i < l; i++) 
	{
		searchNodes[i].containsNgWord = false;
	}
	if (needRefreshBadge && RuleExecutor.blockedCount > 0) 
	{
		window.bgProcessor.sendRequest(
			'badge', 
			{rules:rules, count: RuleExecutor.blockedCount}, 
			'badge'
		);
	}	
};


RuleExecutor.stopBlockAction = function () 
{
	if (RuleExecutor.blockTimeout) clearTimeout(RuleExecutor.blockTimeout);
	if (RuleExecutor.blockInterval) clearInterval(RuleExecutor.blockInterval);
}

function addToHiddenNodes(node)
{
	for (var i=0, l=hiddenNodes.length; i<l; i++) 
	{
		if (hiddenNodes[i] == node) return;	
	}
	hiddenNodes.push(node);
}


RuleExecutor.findFlaggedChild = function (hideNode, list) 
{
	for (var i=0, l=list.length; i<l; i++) 
	{
		if (!list[i].getAttribute("containsNgWord")) {
			continue;
		}
		if (RuleExecutor.containsAsChild(hideNode, list[i])) {
			return list[i];
		}
	}
	return null;
};

RuleExecutor.containsAsChild = function(rootNode, _node) 
{
	var node = _node;
	while (node) 
	{
		if (node == rootNode) return true;
		node = node.parentNode;
	}
	return false;
};

RuleExecutor.nodeContains = function (node, words)
{
	try {
		var text = node.textContent;
		if (!(text.length>0)) {
			return null;
		}
		for (var i = 0, l = words.length; i < l; i++) 
		{
			var word = words[i];
			if (word.deleted) {
				continue;
			}
			if (word.is_regexp) {
				if (word.regExp && word.regExp.test(text)) {
					return word;
				}
			}
			else {
				if (word.is_complete_matching) 
				{ 
					if (text == word.word) {
						return word;
					} 
				} 
				else
				{ 
					if (text.indexOf(word.word)>-1) {
						return word;
					}
				}
			}
		}
	} catch (ex) {
		console.log("RuleEx ERROR");
		console.log(ex);
		return null;
	}
	return null;
};

/*
	Convert XPath to CSS and add <style> tag in the header
 */
RuleExecutor.addBlockCss = function (xpath)
{
	if (RuleExecutor.styleTag==null)
	{
		RuleExecutor.styleTag = document.createElement('STYLE');
		RuleExecutor.styleTag.type = 'text/css';
		document.getElementsByTagName('HEAD')[0].appendChild(RuleExecutor.styleTag);
	}
	RuleExecutor.styleTag.innerHTML = RuleExecutor.styleTag.innerHTML + (xpath + '{display:none;}');
}
