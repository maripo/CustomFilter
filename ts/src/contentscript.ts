/*
	contentscript.ts
	2011-2018 Maripo GODA
 */
let timeZero = new Date().getTime();
function elapsed () {
	return new Date().getTime() - timeZero;
}
let customBlockerBgCallback = null;
window.ruleEditor = null;

/**
 * Communicate with background page to control tabs and popups
 */
class BackgroundCommunicator {
	/**
	 * Send message to background page
	 */
	sendRequest (command, param) {
		param.command = command;
		this.bgPort.postMessage({command:command, param:param});
	}

	/**
	 Called when contentscript received a message from background.
	 */
	 processBackgroundRequest (request, sender, sendResponse) {
		customBlockerBgCallback = sendResponse;
		switch (request.command) {
			case 'init':
				this.execInit(request); break;
			case 'highlight':
				this.execHighlight(request); break;
			case 'ruleEditor':
				this.execRuleEditor(request); break;
			case 'ruleSaveDoneRuleSmart':
				this.execRuleSaveDoneSmartEditor(request); break;
			case 'stop':
				this.execStop(request); break;
			case 'resume':
				this.execResume(request); break;
			case 'reload':
				console.log("Reloaded.");
				this.execReloadDelayed(request); break;
			case 'quickRuleCreation':
				this.execQuickRuleCreation(request); break;
		}
	}
	execInit (request) {
		let allRules = request.rules;
		if (window.customBlockerInitDone) return;
		window.customBlockerInitDone = true;
		rules = new Array();
		RuleExecutor.checkRules(allRules);
	}

	execHighlight (request) {
		window.elementHighlighter.highlightRule(request.rule);
	}

	execRuleEditor (request) {
		if (!window.ruleEditor) {
			console.log("window.ruleEditor not found.");
			window.ruleEditor = new RuleEditor();
		}
		window.ruleEditor.initialize(request.rule, request.appliedRuleList);
	}

	execRuleSaveDoneSmartEditor (request) {
		window.smartRuleCreatorDialog.onSaveDone(request.rule);
	}

	execStop (request) {
		if (RuleExecutor.blockInterval) window.clearInterval(RuleExecutor.blockInterval);
		RuleExecutor.blockInterval = null;
	}

	execResume (request) {
		if (!RuleExecutor.blockInterval)
			RuleExecutor.blockInterval = window.setInterval(RuleExecutor.execBlock, 2000);
	}

	pendingRules:[Rule];
	execReloadDelayed (request) {
		this.pendingRules = request.rules;
		if (!document.hidden) {
			// Apply immediately if the tab is foreground
			this.execReload();
		}
	}
	execReload () {
		if (this.pendingRules == null) {
			return;
		}
		rules = new Array();
		RuleExecutor.checkRules(this.pendingRules);
		this.pendingRules = null;
	}
	onVisibilityChange (isHidden: boolean) {
		if (!isHidden) {
			this.execReload();
		}
	}
	//onVisibilityChange

	execQuickRuleCreation (request) {
		if (!window.smartRuleCreatorDialog) {
			window.smartRuleCreatorDialog = new SmartRuleCreatorDialog(RuleEditor.getMaxZIndex() + 1, request.src);
		}
		let creator = new SmartRuleCreator(lastRightClickedElement, request.appliedRuleList, request.selectionText, request.needSuggestion);
	}

	bgPort:any/* Port */;
	start () {
		let scope = this;
		chrome.runtime.onConnect.addListener(function(port) {
			scope.bgPort = port;
			port.onMessage.addListener(function(msg) {
				scope.processBackgroundRequest(msg, null, null);
		  });
		});
	}
}


chrome.extension.sendRequest({command:"requestRules"});

if (!window.elementHighlighter)
	window.elementHighlighter = new ElementHighlighter();
if (!window.bgCommunicator) {
	window.bgCommunicator = new BackgroundCommunicator();
	window.bgCommunicator.start();
}

document.addEventListener('visibilitychange', function() {
	window.bgCommunicator.onVisibilityChange(document.hidden);
});

chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
		console.warn("WARNING: Legacy request type.");
		console.warn(request);
		window.bgCommunicator.processBackgroundRequest(request, sender, sendResponse);
	}
);

// Right-clicked event source
let lastRightClickedElement = null;
let lastRightClickEvent = null;
document.body.oncontextmenu = function(event){
	lastRightClickedElement=event.srcElement;
	lastRightClickEvent=event
};
let needExecBlock = true;
document.body.addEventListener('DOMNodeInserted', (event)=>{
	needExecBlock = true;
});
