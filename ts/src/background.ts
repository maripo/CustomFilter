let initDone = false;
let existingTabs = new Array();
let tabBadgeMap = new Array(); /* tabId, badgeCount */

let ruleList:Rule[] = [];

/**
 * Initialization
 */
function onStartBackground(): void {
	updateDbIfNeeded(createRuleTable);
}

function removeFromExistingTabList (tabIdToRemove): void {
	for (let id in existingTabs) {
		if (tabIdToRemove==id) existingTabs[id] = null;
	}
}
function addToExistingTabList (tabIdToAdd:number): void {
	existingTabs[tabIdToAdd] = true;
}

interface ElementHighlighter {
	// TODO replace.
}
interface Window {
	reloadLists: ()=>void;
	manualDataMigration: ()=>void;
	elementHighlighter: any;
	smartRuleCreatorDialog: any;
	bgCommunicator: BackgroundCommunicator;
	ruleEditor: RuleEditor;
	customBlockerInitDone: any;
	currentHideFilter: any;
	currentSearchFilter: any;
	openRulePicker: (Rule)=>void;
	getAppliedRules: (any)=>void;
	highlightRuleElements: (Rule)=>void;
	setIconDisabled: (boolean)=>void;
}
interface HTMLElement {
	isTmpSelectedForHide: boolean;
	isTmpSelectedForSearch: boolean;
	isSelectedForHide: boolean;
	isSelectedForSearch: boolean;
	originalStyle: any;
	tmpSelectForHide: any;
	tmpSelectForSearch: any;
	focusForHide: (Event)=>void;
	focusForSearch: (Event)=>void;
	unfocus: (Event)=>void;
	tmpUnselect: (Event)=>void;
}

function reloadLists (): void {
	console.log("reloadLists")
	loadLists();
}

function openRulePicker (selectedRule:Rule): void {
	let status = (selectedRule)?'edit':'create';
	try {
		chrome.tabs.getSelected(null,function(tab) {
			let tabInfo = tabMap[tab.id];
			if (!tabInfo) {
				return;
			}
			let appliedRules = (tabInfo) ? tabInfo.appliedRules: [];
			tabInfo.postMessage({
				command: 'ruleEditor',
				rule: selectedRule,
				appliedRuleList: appliedRules
			});
		});
	}
	catch (ex) {console.log(ex)}
}
chrome.extension.onRequest.addListener(function(request, sender) {
	if (request.command == "requestRules") {
		tabOnUpdate(sender.tab.id, null, sender.tab);
	}
});

class CustomBlockerTab {
	url:string;
	tabId:number;
	port;
	appliedRules: [Rule];

	constructor(tabId:number, tab) {
		this.tabId = tab.id;
		this.url = tab.url;
		this.appliedRules = [] as [Rule];

		// Open port (New background-to-contentscript channel)
		// https://developer.chrome.com/apps/messaging#connect
		this.port = chrome.tabs.connect(tabId, {});
		let self = this;
		this.port.onMessage.addListener(function(msg) {
			self.onMessage(msg);
		});
	}

	execCallbackDb (param): void {
		console.log("TODO execCallbackDb");
	}

	execCallbackSetApplied (param): void {
		this.appliedRules = param.list as [Rule];
		let iconPath = "icon/" + ((this.appliedRules.length>0)?'icon.png':'icon_disabled.png');
		try {
			chrome.browserAction.setIcon(
				{
					path: iconPath,
					tabId:this.tabId
				});
		} catch (ex) {
			console.log(ex);
		}
	}

	execCallbackBadge (param): void {
		let count = param.count;
		try {
			let badgeText = '' + count;
			tabBadgeMap[this.tabId] = badgeText;
			if (localStorage.badgeDisabled!="true") {
				chrome.browserAction.setBadgeText({
					text: badgeText,
					tabId: this.tabId
				});
			}
			chrome.browserAction.setTitle({
				title: getBadgeTooltipString(count),
				tabId:this.tabId
			});
			this.appliedRules = param.rules as [Rule];
		} catch (ex) {
			console.log(ex)
		}
	}

	postMessage (message:object) {
		try {
			this.port.postMessage(message);
		} catch (e) {
			console.log(e);
		}
	}

	onMessage (message) {
		console.log("onMessage");
		console.log(message);
		switch (message.command) {
			case 'badge':
				this.execCallbackBadge(message.param);
				break;
			case 'setApplied':
				this.execCallbackSetApplied(message.param);
				break;
			case 'notifyUpdate':
				this.execCallbackDb(message.param);
				break;
		}
	}
	static postMessage (tabId, message:object) {
		let tabInfo = tabMap[tabId];
		if (!tabInfo) {
			console.log("CustomBlockerTab.postMessage tab not found.");
			return;
		}
		tabInfo.postMessage(message);
	}
	static postMessageToAllTabs ( message:object) {
		for (let tabId in tabMap) {
			CustomBlockerTab.postMessage(tabId, message);
		}
	}
}

let tabMap = {};


let tabOnUpdate = function(tabId:number, changeInfo, tab): void {
	addToExistingTabList(tabId);
	// ON/OFF
	let isDisabled = ('true' == localStorage.blockDisabled);
	_setIconDisabled(isDisabled, tabId);
	if (isDisabled) {
		return;
	}
	let url = tab.url;
	if (isValidURL(url)/* && changeInfo.status == "complete"*/) {
		tabMap[tabId] = new CustomBlockerTab(tabId, tab);
		// Legacy communication channel. Replace it with a long-lived connection
		tabMap[tabId].postMessage({
			command:'init',
			rules: ruleList,
			tabId: tabId
		});
	}
}
let VALID_URL_REGEX = new RegExp('^https?:');
function isValidURL (url: string) : boolean {
	return  url!=null && VALID_URL_REGEX.test(url);
}

/* Legacy communication channel */
function getForegroundCallback (tabId) {
	return function (param) {
		//handleForegroundMessage(tabId, param);
	}
};

function handleForegroundMessage (tabId, param) {
	console.log("Foreground message received.");
	console.log(param);
	if (!param) return;
	let useCallback = false;
	switch (param.command) {
		case 'badge':
			//execCallbackBadge(tabId, param);
			break;
		case 'setApplied':
			//execCallbackSetApplied(tabId, param);
			break;
		case 'notifyUpdate':
			//useCallback = true;
			//execCallbackDb(tabId, param);
			break;
	}
}

function getAppliedRules (callback): void {
	chrome.tabs.getSelected(null,function(tab) {
		try {
			let appliedRules = (tabMap[tab.id]) ? tabMap[tab.id].appliedRules : [];
			callback(appliedRules);
		}
		catch (ex) {console.log(ex)}
	});

}
let smartRuleEditorSrc = '';
function loadSmartRuleEditorSrc() {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function()
	{
		if (xhr.readyState==4)
		{
			if (xhr.status==0 || xhr.status==200)
			{
				smartRuleEditorSrc = xhr.responseText;
			}
		}
	}
	xhr.open("GET", chrome.extension.getURL('/smart_rule_editor_'+chrome.i18n.getMessage("extLocale")+'.html'), true);
	xhr.send();
}

//if (!chrome.tabs.customBlockerOnUpdateSet) {
{
	chrome.tabs.onRemoved.addListener
		(function(tabId, removeInfo)
			{
				removeFromExistingTabList(tabId);
				tabMap[tabId] = null;
			});
	chrome.tabs.onSelectionChanged.addListener (function(_tabId:number, selectInfo) {
		let tabId = _tabId;
		for (let _index in existingTabs) {
			var tabIdToDisable = parseInt(_index);
			if (tabIdToDisable && tabIdToDisable!=tabId) {
				CustomBlockerTab.postMessage(tabIdToDisable, {command: 'stop' });
			}
		}
		try {
			if ('true' == localStorage.blockDisabled) {
				// _setIconDisabled(!applied, tabId); // TODO
			} else {
				let appliedRules = (tabMap[tabId]) ? tabMap[tabId].appliedRules : [];
				let applied = appliedRules.length>0;
				let iconPath =  "icon/" + ((applied)?'icon.png':'icon_disabled.png');
				chrome.browserAction.setIcon(
				{
					path: iconPath,
					tabId: tabId
				});

			}
			CustomBlockerTab.postMessage(tabId, { command: 'resume' });
			if (tabBadgeMap[tabId])
			{
				if (localStorage.badgeDisabled!="true") {
					chrome.browserAction.setBadgeText({
						text: tabBadgeMap[tabId],
						tabId: tabId
					});
				}
			}
		}
		catch (ex) {console.log(ex);}
	});
}
function setIconDisabled (isDisabled): void
{
	chrome.tabs.getSelected(null,function(tab)
	{
		_setIconDisabled(isDisabled,tab.id);
	});
}
function _setIconDisabled (isDisabled, tabId): void
{
	if (localStorage.badgeDisabled!="true") {
		chrome.browserAction.setBadgeText({
			text: (isDisabled)?'OFF':'',
			tabId: tabId
		});
	}
	let iconPath = "icon/" + ((isDisabled)?'icon_disabled.png':'icon.png');
	chrome.browserAction.setIcon(
	{
		path: iconPath,
		tabId: tabId
	});

}
function highlightRuleElements (rule: Rule): void {
	chrome.tabs.getSelected(null, function (tab) {
		CustomBlockerTab.postMessage(tab.id, {
					command: 'highlight',
					rule: rule
			});
	});
}

function getBadgeTooltipString (count): string {
	if (count > 1)
		return chrome.i18n.getMessage("tooltipCount").replace("__count__",count);
	else
		return chrome.i18n.getMessage("tooltipCountSingle");
}

function menuCreateOnRightClick(clicked, tab): void {
	sendQuickRuleCreationRequest(clicked, tab, true);
};

function menuAddOnRightClick(clicked, tab): void {
	sendQuickRuleCreationRequest(clicked, tab, false);
};

function sendQuickRuleCreationRequest (clicked, tab, needSuggestion:boolean): void {
	let appliedRules = (tabMap[tab.id]) ? tabMap[tab.id].appliedRules: [];
	CustomBlockerTab.postMessage(tab.id,
			{
				command: 'quickRuleCreation',
				src: smartRuleEditorSrc,
				appliedRuleList: appliedRules,
				selectionText: clicked.selectionText,
				needSuggestion: needSuggestion
			});
};

var menuIdCreate = chrome.contextMenus.create({"title": chrome.i18n.getMessage('menuCreateRule'), "contexts":["selection"],
	"onclick": menuCreateOnRightClick});
var menuIdAdd = chrome.contextMenus.create({"title": chrome.i18n.getMessage('menuAddToExistingRule'), "contexts":["selection"],
	"onclick": menuAddOnRightClick});

chrome.runtime.onInstalled.addListener(function(details) {
	console.log("reason=" + details.reason);
	console.log("previousVersion=" + details.previousVersion);
	if ("install"==details.reason) { //TODO debug
		console.log("New install.");
		window.open(chrome.extension.getURL('/welcome_install_'+chrome.i18n.getMessage("extLocale")+'.html?install'));
	}
	else if (details.reason=="update" && details.previousVersion && details.previousVersion.match(/^2\./)) {
		window.open(chrome.extension.getURL('/welcome_'+chrome.i18n.getMessage("extLocale")+'.html'));
	}
});

window.onload = function() {
	onStartBackground();
}
chrome.storage.onChanged.addListener(function(changes, namespace) {
		cbStorage.sync(changes, namespace, function () {
			// onLocalChange
			cbStorage.loadAll(function(rules:[Rule], groups:[WordGroup]){
				CustomBlockerTab.postMessageToAllTabs({command:'reload', rules: rules});
			});
		});
});
