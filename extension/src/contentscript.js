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
        console.log("sendRequest");
        console.log(param);
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
                this.execReload(request);
                break;
            case 'quickRuleCreation':
                this.execQuickRuleCreation(request);
                break;
        }
    };
    BackgroundCommunicator.prototype.execInit = function (request) {
        cbStorage.loadAll(function (allRules) {
            if (window.customBlockerInitDone)
                return;
            window.customBlockerInitDone = true;
            rules = new Array();
            RuleExecutor.checkRules(allRules);
        });
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
    BackgroundCommunicator.prototype.execReload = function (request) {
        rules = new Array();
        RuleExecutor.checkRules(request.rules);
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
            console.log("Connection established.");
            console.log(port);
            scope.bgPort = port;
            port.onMessage.addListener(function (msg) {
                console.log("port.onMessage: ");
                console.log(msg);
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
chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    console.warn("WARNING: Legacy request type.");
    console.warn(request);
    window.bgCommunicator.processBackgroundRequest(request, sender, sendResponse);
});
var lastRightClickedElement = null;
var lastRightClickEvent = null;
document.body.oncontextmenu = function (event) { lastRightClickedElement = event.srcElement; lastRightClickEvent = event; };
//# sourceMappingURL=contentscript.js.map