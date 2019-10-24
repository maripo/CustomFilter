var timeZero = new Date().getTime();
function elapsed() {
    return new Date().getTime() - timeZero;
}
var customBlockerBgCallback = null;
window.ruleEditor = null;
var BackgroundCommunicator = (function () {
    function BackgroundCommunicator() {
    }
    BackgroundCommunicator.prototype.sendRequest = function (command, param) {
        param.command = command;
        this.bgPort.postMessage({ command: command, param: param });
    };
    BackgroundCommunicator.prototype.processBackgroundRequest = function (request, sender, sendResponse) {
        customBlockerBgCallback = sendResponse;
        switch (request.command) {
            case 'init':
                this.execInit(request);
                break;
            case 'highlight':
                this.execHighlight(request);
                break;
            case 'ruleEditor':
                this.execRuleEditor(request);
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
                console.log("Reloaded.");
                this.execReloadDelayed(request);
                break;
            case 'quickRuleCreation':
                this.execQuickRuleCreation(request);
                break;
        }
    };
    BackgroundCommunicator.prototype.execInit = function (request) {
        var allRules = request.rules;
        if (window.customBlockerInitDone)
            return;
        window.customBlockerInitDone = true;
        rules = new Array();
        RuleExecutor.checkRules(allRules);
    };
    BackgroundCommunicator.prototype.execHighlight = function (request) {
        window.elementHighlighter.highlightRule(request.rule);
    };
    BackgroundCommunicator.prototype.execRuleEditor = function (request) {
        if (!window.ruleEditor) {
            console.log("window.ruleEditor not found.");
            window.ruleEditor = new RuleEditor();
        }
        window.ruleEditor.initialize(request.rule, request.appliedRuleList);
    };
    BackgroundCommunicator.prototype.execRuleSaveDoneSmartEditor = function (request) {
        window.smartRuleCreatorDialog.onSaveDone(request.rule);
    };
    BackgroundCommunicator.prototype.execStop = function (request) {
        if (RuleExecutor.blockInterval)
            window.clearInterval(RuleExecutor.blockInterval);
        RuleExecutor.blockInterval = null;
    };
    BackgroundCommunicator.prototype.execResume = function (request) {
        if (!RuleExecutor.blockInterval)
            RuleExecutor.blockInterval = window.setInterval(RuleExecutor.execBlock, 2000);
    };
    BackgroundCommunicator.prototype.execReloadDelayed = function (request) {
        this.pendingRules = request.rules;
        if (!document.hidden) {
            this.execReload();
        }
    };
    BackgroundCommunicator.prototype.execReload = function () {
        if (this.pendingRules == null) {
            return;
        }
        rules = new Array();
        RuleExecutor.checkRules(this.pendingRules);
        this.pendingRules = null;
    };
    BackgroundCommunicator.prototype.onVisibilityChange = function (isHidden) {
        if (!isHidden) {
            this.execReload();
        }
    };
    BackgroundCommunicator.prototype.execQuickRuleCreation = function (request) {
        if (!window.smartRuleCreatorDialog) {
            window.smartRuleCreatorDialog = new SmartRuleCreatorDialog(RuleEditor.getMaxZIndex() + 1, request.src);
        }
        var creator = new SmartRuleCreator(lastRightClickedElement, request.appliedRuleList, request.selectionText, request.needSuggestion);
    };
    BackgroundCommunicator.prototype.start = function () {
        var scope = this;
        chrome.runtime.onConnect.addListener(function (port) {
            scope.bgPort = port;
            port.onMessage.addListener(function (msg) {
                scope.processBackgroundRequest(msg, null, null);
            });
        });
    };
    return BackgroundCommunicator;
}());
chrome.extension.sendRequest({ command: "requestRules" });
if (!window.elementHighlighter)
    window.elementHighlighter = new ElementHighlighter();
if (!window.bgCommunicator) {
    window.bgCommunicator = new BackgroundCommunicator();
    window.bgCommunicator.start();
}
document.addEventListener('visibilitychange', function () {
    window.bgCommunicator.onVisibilityChange(document.hidden);
});
chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    console.warn("WARNING: Legacy request type.");
    console.warn(request);
    window.bgCommunicator.processBackgroundRequest(request, sender, sendResponse);
});
var lastRightClickedElement = null;
var lastRightClickEvent = null;
document.body.oncontextmenu = function (event) {
    lastRightClickedElement = event.srcElement;
    lastRightClickEvent = event;
};
var needExecBlock = true;
document.body.addEventListener('DOMNodeInserted', function (event) {
    needExecBlock = true;
});
//# sourceMappingURL=contentscript.js.map