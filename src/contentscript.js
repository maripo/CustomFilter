/*
 2011 Maripo GODA

 */
var bgCallback = null;


window.ruleEditor = null;

var BgProcessor = function ()
{

};

BgProcessor.prototype.processBackgroundRequest = function (request, sender, sendResponse)
{

	if ('init'==request.command && request.rules) 
	{
		bgCallback = sendResponse;
		if (window.customBlockerInitDone) return;
		
		window.customBlockerInitDone = true;
		rules = new Array();
		RuleExecutor.checkRules(request.rules);
	}
	else if ('badge'==request.command) 
	{
		bgCallback = sendResponse;
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
			RuleExecutor.blockInterval = window.setInterval(RuleExecutor.execBlock, 2000);
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
};

if (!window.elementHighlighter)
	window.elementHighlighter = new ElementHighlighter();
if (!window.bgProcessor)
	window.bgProcessor = new BgProcessor();

chrome.extension.onRequest.addListener
(
	function (request, sender, sendResponse) 
	{
		window.bgProcessor.processBackgroundRequest(request, sender, sendResponse)
	}
);

//Memorize right-clicked event source
var lastRightClickedElement = null;
var lastRightClickEvent = null; 
document.body.oncontextmenu = function(event){lastRightClickedElement=event.srcElement; lastRightClickEvent=event};

