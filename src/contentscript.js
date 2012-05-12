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
	switch (request.command)
	{
		case 'init':
			this.execInit(request, sendResponse); break;
		case 'badge':
			this.execBadge(request, sendResponse); break;
		case 'highlight':
			this.execHighlight(request, sendResponse); break;
		case 'ruleEditor':
			this.execRuleEditor(request, sendResponse); break;
		case 'ruleSaveDone':
			this.execRuleSaveDone(request,sendResponse); break;
		case 'ruleEditorRegister':
			this.execRuleEditorRegister(); break;
		case 'stop':
			this.execStop(request, sendResponse); break;
		case 'resume':
			this.execResume(request, sendResponse); break;
		case 'quickRuleCreation':
			this.execQuickQuleCreation(request, sendResponse); break;
	}
};
BgProcessor.prototype.execInit = function (request, sendResponse)
{
	bgCallback = sendResponse;
	if (request.rules)
	{
		if (window.customBlockerInitDone) return;
		
		window.customBlockerInitDone = true;
		rules = new Array();
		RuleExecutor.checkRules(request.rules);
	}
};
BgProcessor.prototype.execBadge = function (request, sendResponse)
{
	bgCallback = sendResponse;
};
BgProcessor.prototype.execHighlight = function (request, sendResponse)
{
	window.elementHighlighter.highlightRule(request.rule);
	badgeCallback = sendResponse;
};
BgProcessor.prototype.execRuleEditor = function (request, sendResponse)
{
	if (!window.ruleEditor) 
	{
		window.ruleEditor = new RuleEditor(request.rule, request.src, request.appliedRuleList);
		window.ruleEditor.initialize();
		window.ruleEditor.bgCallback = sendResponse;
	}
};
BgProcessor.prototype.execRuleSaveDone = function (request, sendResponse)
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
};

BgProcessor.prototype.execRuleEditorRegister = function (request, sendResponse)
{
	if (request.bySmartRuleCreator)
	{
		window.smartRuleCreatorDialog.bgCallback = sendResponse;
	}
	else 
	{
		window.ruleEditor.bgCallback = sendResponse;
	}
};
BgProcessor.prototype.execStop = function (request, sendResponse)
{
	bgCallback = sendResponse;
	if (RuleExecutor.blockInterval) window.clearInterval(RuleExecutor.blockInterval);
	RuleExecutor.blockInterval = null;
};
BgProcessor.prototype.execResume = function (request, sendResponse)
{
	bgCallback = sendResponse;
	if (!RuleExecutor.blockInterval)
		RuleExecutor.blockInterval = window.setInterval(RuleExecutor.execBlock, 2000);
};
BgProcessor.prototype.execQuickQuleCreation = function (request, sendResponse)
{
	if (!window.smartRuleCreatorDialog)
	{
		window.smartRuleCreatorDialog = new SmartRuleCreatorDialog(RuleEditor.getMaxZIndex() + 1, request.src);
		window.smartRuleCreatorDialog.bgCallback = sendResponse;
	}			
	var creator = new SmartRuleCreator(lastRightClickedElement, request.appliedRuleList, request.selectionText);
	window.smartRuleCreatorDialog.show(creator, lastRightClickedElement, lastRightClickEvent);
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

