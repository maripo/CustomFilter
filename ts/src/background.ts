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

function createRuleTable (): void {
	console.log("createRuleTable");
	RulePeer.getInstance().createTable(createWordTable);
}

function createWordTable (): void {
	WordPeer.getInstance().createTable(loadLists);
}

function loadLists (): void {
	RulePeer.getInstance().select('', onRuleListLoaded, null);
}

function onRuleListLoaded (list:Rule[]): void {
	let count = '' + list.length;
	Analytics.trackEvent('loadRuleList', count);
	ruleList = list;
	WordPeer.getInstance().select('', onWordListLoaded, null);
}

function removeFromExistingTabList (tabIdToRemove): void {
	for (var id in existingTabs) {
		if (tabIdToRemove==id) existingTabs[id] = null;
	}
}
function addToExistingTabList (tabIdToAdd:number): void {
	existingTabs[tabIdToAdd] = true;
}

function onWordListLoaded (wordList:Word[]): void {
	var count = '' + wordList.length;
	Analytics.trackEvent('loadWordList', count);
	var ruleMap = new Array();
	for (var i=0, l=ruleList.length; i<l; i++) {
		ruleMap[ruleList[i].rule_id] = ruleList[i];
	}
	for (let i = 0, l = wordList.length; i < l; i++) {
		var rule = ruleMap[wordList[i].rule_id];
		if (rule) {
			rule.words.push(wordList[i]);
		}
	}
	loadSmartRuleEditorSrc();
	saveUuidIfNotSet();
}
interface ElementHighlighter {
	// TODO replace.
}
interface Window {
	reloadLists: ()=>void;
	elementHighlighter: any;
	smartRuleCreatorDialog: any;
	bgProcessor: any;
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
function saveUuidIfNotSet (): void {
	for (let i=0; i<ruleList.length; i++) {
		let rule = ruleList[i];
		let needSave = false;
		if (CustomBlockerUtil.isEmpty(rule.user_identifier)) {
			needSave = true;
			rule.user_identifier = UUID.generate();
		}
		if (CustomBlockerUtil.isEmpty(rule.global_identifier)) {
			needSave = true;
			rule.global_identifier = UUID.generate();
		}
		if (needSave) {
		RulePeer.getInstance().saveObject(rule, 
			function (obj:DbObject): void {
				var bgWindow = chrome.extension.getBackgroundPage();
				bgWindow.reloadLists();
			},
			function (): void { /* Do nothing on failure */});
		}
	}
}

function reloadLists (): void {
	loadLists();
}
function openRulePicker (selectedRule:Rule): void {
	let status = (selectedRule)?'edit':'create';
	Analytics.trackEvent('openRulePicker', status);
	try {
		chrome.tabs.getSelected(null,function(tab) {
			chrome.tabs.sendRequest(tab.id, 
			{
				command: 'ruleEditor',
				rule: selectedRule,
				appliedRuleList: appliedRuleMap[tab.id]
			}, getForegroundCallback(tab.id));
		});
	} 
	catch (ex) {console.log(ex)}
}
chrome.extension.onRequest.addListener(function(request, sender) {
	if (request.command == "requestRules") {
		tabOnUpdate(sender.tab.id, null, sender.tab);
	}
});
var tabOnUpdate = function(tabId:number, changeInfo, tab): void {
	addToExistingTabList(tabId);
	// ON/OFF
	var isDisabled = ('true' == localStorage.blockDisabled);
	_setIconDisabled(isDisabled, tabId);
	if (isDisabled) {
		return;
	}
	var url = tab.url;
	if (isValidURL(url)/* && changeInfo.status == "complete"*/) 
	{
		chrome.tabs.sendRequest(tabId,
		{
			command:'init',
			rules: ruleList,
			tabId: tabId
		},
		getForegroundCallback (tabId)
		);
	}
}
var VALID_URL_REGEX = new RegExp('^https?:');
function isValidURL (url: string) : boolean {
	return  url!=null && VALID_URL_REGEX.test(url);
}

function getForegroundCallback (tabId) {
	return function(param) {
	 console.log("Foreground message received.");
	 console.log(param);
		if (!param) return;
		var useCallback = false;
		switch (param.command)
		{
			case 'badge': 
				execCallbackBadge(tabId, param);
				break;
			case 'setApplied': 
				execCallbackSetApplied(tabId, param);
				break;
			case 'db':
				useCallback = true;
				execCallbackDb(tabId, param);
				break;
			case 'reload':
				useCallback = true;
				execCallbackReload(tabId, param);
				break;
		}
		
		// Set callback
		if (!useCallback)
		{
			chrome.tabs.sendRequest(tabId, 
			{
				command: (param.nextAction || 'badge')
			}, getForegroundCallback (tabId));
		}
	};

};
function execCallbackReload (tabId, param): void {
	chrome.tabs.sendRequest(tabId, 
	{
		command: (param.nextAction),
		rules: ruleList
	}, getForegroundCallback (tabId));

}
function execCallbackDb (tabId:string, param): void {
	try {
		var exPeer;
		if ('save' == param.dbCommand) 
		{
			Analytics.trackEvent('save', 'save');
			var rule =param.obj;
			var saveRuleTask = new SaveRuleTask(rule, reloadLists, tabId);
			saveRuleTask.exec(param.nextAction);
		}
	} 
	catch (e) 
	{
		console.log(e)
	}
}

function execCallbackSetApplied (tabId, param): void
{
	var list = param.list || new Array();
	try
	{
		chrome.browserAction.setIcon(
			{
				path:((list.length>0)?'icon.png':'icon_disabled.png'),
				tabId:tabId
			});
	}
	catch (ex)
	{
		console.log(ex);
	}
	appliedRuleMap[tabId] = list;

};
function execCallbackBadge (tabId, param): void
{
  console.log("execCallbackBadge param=");
  console.log(param);
	var count = param.count;
	try {
		chrome.tabs.sendRequest(tabId, 
				{
					command: (param.nextAction)
				}, getForegroundCallback (tabId));
		var badgeText = '' + count;
		tabBadgeMap[tabId] = badgeText;
		if (localStorage.badgeDisabled!="true") {
			chrome.browserAction.setBadgeText({
				text: badgeText,
				tabId: tabId
			});
		}
		chrome.browserAction.setTitle({
			title: getBadgeTooltipString(count),
			tabId:tabId
		});
		appliedRuleMap[tabId] = param.rules;
	} catch (ex) 
	{
		console.log(ex)
	}

}
function getAppliedRules (callback): void
{
	chrome.tabs.getSelected(null,function(tab)
	{
		try 
		{
			callback(appliedRuleMap[tab.id]);
		} 
		catch (ex) {console.log(ex)}
	});
	
}
var smartRuleEditorSrc = '';
function loadSmartRuleEditorSrc()
{
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

class SaveRuleTask {
	rule:Rule;
	tabId:number;
	saveWords:Word[];
	deleteWords:Word[];
	reloadLists:()=>void;
	constructor (rule:Rule, reloadLists, tabId) {
		let saveWords:Word[] = [];
		let deleteWords:Word[] = [];
		
		for (var i=0, l=rule.words.length; i<l; i++) {
			var word = rule.words[i];
			if (word.isNew) {
				saveWords.push(word);
			}
			else if (word.deleted) {
				deleteWords.push(word);
			}
		}
		
		this.rule = rule;
		this.tabId = tabId;
		
		this.saveWords = saveWords;
		this.deleteWords = deleteWords;
		
		this.reloadLists /* function */ = reloadLists;
	}
	exec (nextAction) {
		//peer, wordPeer
		RulePeer.getInstance().saveObject(this.rule, this.getNextTask(nextAction), function(){});	
	}
	getNextTask (nextAction): (obj:DbObject)=>void {
		var self = this;
		return function () {
			let nextSaveWord = self.getNextSaveWord();
			if (nextSaveWord) {
				WordPeer.getInstance().saveObject(nextSaveWord, self.getNextTask(nextAction), function(){});
				return;
			}
			let nextDeleteWord = self.getNextDeleteWord();
			if (nextDeleteWord) {
				WordPeer.getInstance().deleteObject(nextDeleteWord, self.getNextTask(nextAction), function(){});
				return;
			}
			chrome.tabs.sendRequest(self.tabId,
			{
				command:nextAction,
				rules: ruleList,
				tabId: self.tabId,
				rule: self.rule
			}
			, getForegroundCallback(self.tabId)
			);
			self.reloadLists();
		}
	}
	getNextSaveWord ():Word {
		for (let i=0, l=this.saveWords.length; i<l; i++) {
			let word = this.saveWords[i];
			if (word.dirty) 
			{
				word.rule_id = this.rule.rule_id;
				return word;
			}
		}
		return null;
	}
	getNextDeleteWord () {
		for (var i=0, l=this.deleteWords.length; i<l; i++) 
		{
			var word = this.deleteWords[i];
			if (word.dirty) 
			{
				word.rule_id = this.rule.rule_id;
				return word;
			}
		}
	}
}

var appliedRuleMap = new Array();
//if (!chrome.tabs.customBlockerOnUpdateSet) {
{
	chrome.tabs.onRemoved.addListener
		(function(tabId, removeInfo) 
			{
				removeFromExistingTabList(tabId);
				appliedRuleMap[tabId] = null;
			});
	chrome.tabs.onSelectionChanged.addListener (function(_tabId:number, selectInfo) 
			{
				let tabId = _tabId;
				for (let _index in existingTabs) { 
					var tabIdToDisable = parseInt(_index);
					if (tabIdToDisable && tabIdToDisable!=tabId) {
						chrome.tabs.sendRequest(tabIdToDisable, 
							{
								command: 'stop'
							}, getForegroundCallback (tabIdToDisable));
					}
				}
				try
				{
					if ('true' == localStorage.blockDisabled)
						_setIconDisabled(!applied, tabId);
					else
					{	
						var applied = appliedRuleMap[tabId]
							&& appliedRuleMap[tabId].length>0;
						chrome.browserAction.setIcon(
						{
							path:(applied)?'icon.png':'icon_disabled.png',
							tabId:tabId
						});	
							
					}
					chrome.tabs.sendRequest(tabId, 
						{
							command: 'resume'
						}, getForegroundCallback(tabId));
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
			text:(isDisabled)?'OFF':'',
			tabId: tabId
		});
	}
	chrome.browserAction.setIcon(
	{
		path:(isDisabled)?'icon_disabled.png':'icon.png',
		tabId:tabId
	});	
	
}
function highlightRuleElements (rule: Rule): void
{
	chrome.tabs.getSelected(null,function(tab)
		{
		  // TODO Error occurs when pointing on popup list on background window.
			chrome.tabs.sendRequest(tab.id, 
				{
					command: 'highlight',
					rule: rule
				}, getForegroundCallback(tab.id));
		});
}
function getBadgeTooltipString (count): string {
	if (count > 1)
		return chrome.i18n.getMessage("tooltipCount").replace("__count__",count);
	else
		return chrome.i18n.getMessage("tooltipCountSingle");
}
// chrome.tabs.customBlockerOnUpdateSet = true;
onStartBackground();

function menuCreateOnRightClick(clicked, tab): void {
	sendQuickRuleCreationRequest(clicked, tab, true);
	Analytics.trackEvent('contextMenu', 'create');
};

function menuAddOnRightClick(clicked, tab): void {
	sendQuickRuleCreationRequest(clicked, tab, false);
	Analytics.trackEvent('contextMenu', 'add');
};

function sendQuickRuleCreationRequest (clicked, tab, needSuggestion:boolean): void {
	chrome.tabs.sendRequest(
			tab.id, 
			{
				command: 'quickRuleCreation',
				src: smartRuleEditorSrc,
				appliedRuleList: appliedRuleMap[tab.id],
				selectionText: clicked.selectionText,
				needSuggestion: needSuggestion
			}, 
			getForegroundCallback(tab.id)
		);
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
	else if (details.reason=="update" && details.previousVersion && details.previousVersion.match(/^2\.3\./)) {
		window.open(chrome.extension.getURL('/welcome_'+chrome.i18n.getMessage("extLocale")+'.html'));
	}
});
