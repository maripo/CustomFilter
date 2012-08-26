
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
			if (new RegExp(rule.site_regexp).test(location.href)) 
			{
				rules.push(rule);
			}
		} 
		catch (e) 
		{
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
			Log.d("RuleExecutor BLOCK_ANYWAY " + rule.title);
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
				word.regExp = new RegExp(word.word, 'i')
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
	var searchNodes = (rule.block_anyway)?[]:(
			(rule.search_block_by_css)?
				CustomBlockerUtil.getElementsByCssSelector(rule.search_block_css)
				:
				CustomBlockerUtil.getElementsByXPath(rule.search_block_xpath)
			);
	var hideNodes = (rule.hide_block_by_css)?
			CustomBlockerUtil.getElementsByCssSelector(rule.hide_block_css)
			:
			CustomBlockerUtil.getElementsByXPath(rule.hide_block_xpath);
	for (var i = 0, l = searchNodes.length; i < l; i++) 
	{
		var node = searchNodes[i];
		if (RuleExecutor.nodeContains(node, rule.words)) 
		{
			node.containsNgWord = true;
		}
	}
	for (var i = 0, l = hideNodes.length; i < l; i++) 
	{
		var node = hideNodes[i];
		var shouldBeHidden = rule.block_anyway || RuleExecutor.containsChildFlagged(node, searchNodes);
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
			// Exec callback
			if (onHide)
				onHide(node);
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


RuleExecutor.containsChildFlagged = function (node, list) 
{
	for (var i=0, l=list.length; i<l; i++) 
	{
		if (!list[i].containsNgWord) continue;
		if (RuleExecutor.containsAsChild(node, list[i])) return true;
	}
	return false;
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
	var text = node.textContent;
	if (!(text.length>0)) 
		return false;
	for (var i = 0, l = words.length; i < l; i++) 
	{
		var word = words[i];
		if (word.deleted) continue;
		if (word.is_regexp && word.regExp.test(text)) 
			return true;
		if (!word.is_regexp && text.indexOf(word.word)>-1)
			return true;
	}
	return false;
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
