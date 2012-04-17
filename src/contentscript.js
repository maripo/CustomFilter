/*
 2011 Maripo GODA

 */
var bgCallback = null;
var badgeCallback = null;

if (!window.elementHighlighter)
{
	window.elementHighlighter = new ElementHighlighter();
}
		
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
		RuleExecutor.checkRules(request.rules);
	}
	else if ('badge'==request.command) 
	{
		badgeCallback = sendResponse;
	}
	else if ('highlight'==request.command)
	{
		window.elementHighlighter.highlightRule(request.rule);
		badgeCallback = sendResponse;
	}
	else if ('ruleEditor'==request.command) 
	{
		if (!window.ruleEditor) 
		{
			window.ruleEditor = new RuleEditor(request.rule, request.src, request.appliedRuleList);
			window.ruleEditor.initialize();
			window.ruleEditor.bgCallback = sendResponse;
		}
	}
	else if ('ruleSaveDone'==request.command)
	{
		if (request.bySmartRuleCreator)
		{
			window.smartRuleCreatorDialog.onSaveDone(request.rule);
			window.smartRuleCreatorDialog.bgCallback = sendResponse;
		}
		else if (window.ruleEditor)
		{
			window.ruleEditor.onSaveDone(request.rule);
			window.ruleEditor.bgCallback = sendResponse;
		}
	}
	else if ('ruleEditorRegister'==request.command) 
	{
		if (request.bySmartRuleCreator)
		{
			window.smartRuleCreatorDialog.bgCallback = sendResponse;
		
		}
		else 
		{
			window.ruleEditor.bgCallback = sendResponse;
		}
	}
	else if ('stop'==request.command) 
	{
		bgCallback = sendResponse;
		if (RuleExecutor.blockInterval) window.clearInterval(RuleExecutor.blockInterval);
		RuleExecutor.blockInterval = null;
	}
	else if ('resume'==request.command) 
	{
		bgCallback = sendResponse;
		if (!RuleExecutor.blockInterval)
			RuleExecutor.blockInterval = window.setInterval(execBlock, 2000);
	}
	else if ('quickRuleCreation'==request.command)
	{
		if (!window.smartRuleCreatorDialog)
		{
			window.smartRuleCreatorDialog = new SmartRuleCreatorDialog(RuleEditor.getMaxZIndex() + 1, this, request.src);
			window.smartRuleCreatorDialog.bgCallback = sendResponse;
		}			
		var creator = new SmartRuleCreator(lastRightClickedElement, request.appliedRuleList, request.selectionText);
		window.smartRuleCreatorDialog.show(creator, lastRightClickedElement, lastRightClickEvent);
	}
});


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
	bgCallback(rules);
	if (rules.length > 0) 
		RuleExecutor.startBlock();
}

RuleExecutor.blockTimeout = null;
RuleExecutor.blockInterval = null;

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
				addBlockCss(cssSelector);
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
		RuleExecutor.blockTimeout = setTimeout(execBlock, 50);
		RuleExecutor.blockInterval = setInterval(execBlock, 2000);
	}
}

var styleTag = null;
function addBlockCss (xpath)
{
	if (styleTag==null)
	{
		styleTag = document.createElement('STYLE');
		styleTag.type = 'text/css';
		document.getElementsByTagName('HEAD')[0].appendChild(styleTag);
	}
	styleTag.innerHTML = styleTag.innerHTML + (xpath + '{display:none;}');
}

function stopBlockAction () 
{
	if (RuleExecutor.blockTimeout) clearTimeout(RuleExecutor.blockTimeout);
	if (RuleExecutor.blockInterval) clearInterval(RuleExecutor.blockInterval);
}

function execBlock()
{
	if (!rules) return;
	for (var i = 0; i < rules.length; i++)
	{
		var rule = rules[i];
		if (!rules[i].is_disabled) 
		{
			applyRule(rules[i], false, 
				function (node) 
				{
					if (!rule.staticXpath)
					{
						node.style.display = 'none';
					}
					addToHiddenNodes(node);	
					blockedCount++;
				}
			);
		}
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
	if (needRefreshBadge && blockedCount > 0 && badgeCallback) 
	{
		badgeCallback({count:blockedCount, rules:rules});
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
//Memorize right-clicked event source
var lastRightClickedElement = null;
var lastRightClickEvent = null; 
document.body.oncontextmenu = function(event){lastRightClickedElement=event.srcElement; lastRightClickEvent=event};
