/*
 2011 Maripo GODA
 
 */
var bgCallback = null;
var badgeCallback = null;

var RuleExecutor = 
{
	
};

var rules;
window.ruleEditor = null;
chrome.extension.onRequest.addListener(function(request, sender, sendResponse)
{
	if ('init'==request.command &&request.rules) 
	{
		if (window.customBlockerInitDone) return;
		window.customBlockerInitDone = true;
		rules = new Array();
		bgCallback = sendResponse;
		checkRules(request.rules);
	}
	else if ('badge'==request.command) 
	{
		badgeCallback = sendResponse;
	}
	else if ('ruleEditor'==request.command) 
	{
		if (!window.ruleEditor) 
		{
			window.ruleEditor = new RuleEditor(request.rule, request.src);
			window.ruleEditor.initialize();
			window.ruleEditor.bgCallback = sendResponse;
		}
	}
	else if ('ruleSaveDone'==request.command)
	{
		if (window.ruleEditor)
		{
			window.ruleEditor.onSaveDone(request.rule);
			window.ruleEditor.bgCallback = sendResponse;
		}
	}
	else if ('ruleEditorRegister'==request.command) 
	{
		window.ruleEditor.bgCallback = sendResponse;
	}
	else if ('stop'==request.command) 
	{
		bgCallback = sendResponse;
		if (blockInterval) window.clearInterval(blockInterval);
		blockInterval = null;
	}
	else if ('resume'==request.command) 
	{
		bgCallback = sendResponse;
		if (!blockInterval)
			blockInterval = window.setInterval(execBlock, 2000);
	}
});


function checkRules(list)
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
	bgCallback(rules);
	if (rules.length > 0) 
		startBlock();
}

var blockTimeout = null;
var blockInterval = null;

function startBlock()
{
	for (var i=0, l=rules.length; i<l; i++) 
	{
		for (var j=0; j< rules[i].words.length; j++) 
		{
			var word = rules[i].words[j];
			if (word.is_regexp)
				word.regExp = new RegExp(word.word, 'i')
		}
	}
	blockTimeout = setTimeout(execBlock, 50);
	blockInterval = setInterval(execBlock, 2000);
}

function stopBlockAction () 
{
	if (blockTimeout) clearTimeout(blockTimeout);
	if (blockInterval) clearInterval(blockInterval);
}

function execBlock()
{
	for (var i = 0; i < rules.length; i++) 
		if (!rules[i].is_disabled) 
		{
			applyRule(rules[i], false, 
				function (node) 
				{
					node.style.display = 'none';
					addToHiddenNodes(node);	
					blockedCount++;
				}
			);
		}
}
function addToHiddenNodes(node)
{
	for (var i=0, l=hiddenNodes.length; i<l; i++) 
	{
		if (hiddenNodes[i] == node) return;	
	}
	hiddenNodes.push(node);
}
var blockedCount = 0;
var hiddenNodes = new Array();
function applyRule(rule, /* boolean */ ignoreHidden, /*function(node)*/onHide, isTesting)
{
	var needRefreshBadge = false;
	var searchNodes = (rule.block_anyway)?[]:CustomBlockerUtil.getElementsByXPath(rule.search_block_xpath);
	var hideNodes = CustomBlockerUtil.getElementsByXPath(rule.hide_block_xpath);
	for (var i = 0, l = searchNodes.length; i < l; i++) 
	{
		var node = searchNodes[i];
		if (nodeContains(node, rule.words)) 
		{
			node.containsNgWord = true;
		}
	}
	for (var i = 0, l = hideNodes.length; i < l; i++) 
	{
		var node = hideNodes[i];
		var shouldBeHidden = rule.block_anyway || containsChildFlagged(node, searchNodes);
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
	if (needRefreshBadge && blockedCount > 0 && badgeCallback) 
	{
		badgeCallback(blockedCount);
		badgeCallback = null;
	}	
}
function containsChildFlagged (node, list) 
{
	for (var i=0, l=list.length; i<l; i++) 
	{
		if (!list[i].containsNgWord) continue;
		if (containsAsChild(node, list[i])) return true;
	}
	return false;
}
function containsAsChild(rootNode, _node) 
{
	var node = _node;
	while (node) 
	{
		if (node == rootNode) return true;
		node = node.parentNode;
	}
	return false;
}
function nodeContains(node, words)
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
}
