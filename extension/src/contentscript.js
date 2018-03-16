var timeZero = new Date().getTime();
function elapsed() {
    return new Date().getTime() - timeZero;
}
var customBlockerBgCallback = null;
window.ruleEditor = null;
var BgProcessor = function () {
};
BgProcessor.prototype.sendRequest = function (command, param, nextAction) {
    param.command = command;
    param.nextAction = nextAction;
    if (!customBlockerBgCallback) {
        console.log("bgCallback not found. command:" + command);
        return;
    }
    try {
        customBlockerBgCallback(param);
        customBlockerBgCallback = null;
    }
    catch (ex) {
        console.log(ex);
    }
};
BgProcessor.prototype.processBackgroundRequest = function (request, sender, sendResponse) {
    customBlockerBgCallback = sendResponse;
    switch (request.command) {
        case 'init':
            this.execInit(request);
            break;
        case 'badge':
            this.execBadge(request);
            break;
        case 'highlight':
            this.execHighlight(request);
            break;
        case 'ruleEditor':
            this.execRuleEditor(request);
            break;
        case 'ruleSaveDoneRuleEditor':
            this.execRuleSaveDoneRuleEditorFrame(request);
            break;
        case 'ruleSaveDoneRuleSmart':
            this.execRuleSaveDoneSmartEditor(request);
            break;
        case 'stop':
            this.execStop(request);
            break;
        case 'resume':
            this.execResume(request);
            break;
        case 'reload':
            this.execReload(request);
            break;
        case 'quickRuleCreation':
            this.execQuickRuleCreation(request);
            break;
    }
};
chrome.extension.sendRequest({ command: "requestRules" });
BgProcessor.prototype.execInit = function (request) {
    if (request.rules) {
        if (window.customBlockerInitDone)
            return;
        window.customBlockerInitDone = true;
        rules = new Array();
        RuleExecutor.checkRules(request.rules);
    }
};
BgProcessor.prototype.execBadge = function (request) {
};
BgProcessor.prototype.execHighlight = function (request) {
    window.elementHighlighter.highlightRule(request.rule);
};
BgProcessor.prototype.execRuleEditor = function (request) {
    if (!window.ruleEditor) {
        console.log("window.ruleEditor not found.");
        window.ruleEditor = new RuleEditor();
    }
    window.ruleEditor.initialize(request.rule, request.appliedRuleList);
};
BgProcessor.prototype.execRuleSaveDoneRuleEditorFrame = function (request) {
    window.ruleEditor.onSaveDone(request.rule);
};
BgProcessor.prototype.execRuleSaveDoneSmartEditor = function (request) {
    window.smartRuleCreatorDialog.onSaveDone(request.rule);
};
BgProcessor.prototype.execStop = function (request) {
    if (RuleExecutor.blockInterval)
        window.clearInterval(RuleExecutor.blockInterval);
    RuleExecutor.blockInterval = null;
};
BgProcessor.prototype.execResume = function (request) {
    if (!RuleExecutor.blockInterval)
        RuleExecutor.blockInterval = window.setInterval(RuleExecutor.execBlock, 2000);
};
BgProcessor.prototype.execReload = function (request) {
    rules = new Array();
    RuleExecutor.checkRules(request.rules);
};
BgProcessor.prototype.execQuickRuleCreation = function (request) {
    if (!window.smartRuleCreatorDialog) {
        window.smartRuleCreatorDialog = new SmartRuleCreatorDialog(RuleEditor.getMaxZIndex() + 1, request.src);
    }
    var creator = new SmartRuleCreator(lastRightClickedElement, request.appliedRuleList, request.selectionText, request.needSuggestion);
};
if (!window.elementHighlighter)
    window.elementHighlighter = new ElementHighlighter();
if (!window.bgProcessor)
    window.bgProcessor = new BgProcessor();
chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    window.bgProcessor.processBackgroundRequest(request, sender, sendResponse);
});
var lastRightClickedElement = null;
var lastRightClickEvent = null;
document.body.oncontextmenu = function (event) { lastRightClickedElement = event.srcElement; lastRightClickEvent = event; };
//# sourceMappingURL=contentscript.js.map