var initDone = false;
var peer = RulePeer.getInstance();
var wordPeer = WordPeer.getInstance();
var existingTabs = new Array();
var tabBadgeMap = new Array(); /* tabId, badgeCount */

/**
 * Initialization
 */
function onStart () 
{
	updateDbIfNeeded(createRuleTable);
}
function createRuleTable ()
{
	console.log("createRuleTable");
	peer.createTable(createWordTable);
}
function createWordTable () 
{
	wordPeer.createTable(loadLists);
}
function loadLists (callback) 
{
	peer.select('', onRuleListLoaded, null);
}
function onRuleListLoaded (list) 
{
	ruleList = list;
	wordPeer.select('', onWordListLoaded, null);
}
function removeFromExistingTabList (tabIdToRemove)
{
	for (var id in existingTabs)
	{
		if (tabIdToRemove==id) existingTabs[id] = null;
	}
}
function addToExistingTabList (tabIdToAdd)
{
	existingTabs[tabIdToAdd] = true;
}
function onWordListLoaded (wordList) 
{
	var ruleMap = new Array();
	for (var i=0, l=ruleList.length; i<l; i++) 
	{
		ruleMap[ruleList[i].rule_id] = ruleList[i];
	}
	for (var i = 0, l = wordList.length; i < l; i++) 
	{
		var rule = ruleMap[wordList[i].rule_id];
		if (rule) 
		{
			rule.words.push(wordList[i]);
		}
	}
	loadRulePickerSrc();
	saveUuidIfNotSet();
}

function saveUuidIfNotSet ()
{
	for (var i=0; i<ruleList.length; i++)
	{
		var rule = ruleList[i];
		var needSave = false;
		if (CustomBlockerUtil.isEmpty(rule.user_identifier))
		{
			needSave = true;
			rule.user_identifier = UUID.generate();
		}
		if (CustomBlockerUtil.isEmpty(rule.global_identifier))
		{
			needSave = true;
			rule.global_identifier = UUID.generate();
		}
		if (needSave)
		{
		peer.saveObject(rule, function () 
			{
				var bgWindow = chrome.extension.getBackgroundPage();
				bgWindow.reloadLists();
			});
		}
	}
}

function reloadLists () 
{
	loadLists();
}
function openRulePicker (selectedRule) 
{
	try 
	{
		chrome.tabs.getSelected(null,function(tab)
		{
			chrome.tabs.sendRequest(tab.id, 
			{
				command: 'ruleEditor',
				src: rulePickerSrc,
				rule: selectedRule,
				appliedRuleList: appliedRuleMap[tab.id]
			}, getForegroundCallback(tab.id));
		});
	} 
	catch (ex) {console.log(ex)}
}
var tabOnUpdate = function(tabId, changeInfo, tab)
{
	addToExistingTabList(tabId);
	// ON/OFF
	var isDisabled = ('true' == localStorage.blockDisabled);
	_setIconDisabled(isDisabled, tabId);
	if (isDisabled) {
		return;
	}
	var url = tab.url;
	if (isValidURL(url) && changeInfo.status == "complete") 
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
function isValidURL (url) 
{
	return  url && url.match(VALID_URL_REGEX);
}

function getForegroundCallback (tabId)
{
	return function(param)
	{
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
function execCallbackReload (tabId, param)
{
	chrome.tabs.sendRequest(tabId, 
	{
		command: (param.nextAction),
		rules: ruleList
	}, getForegroundCallback (tabId));

}
function execCallbackDb (tabId, param)
{
	try 
	{
		var exPeer;
		if ('save' == param.dbCommand) 
		{
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
function execCallbackSetApplied (tabId, param)
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
function execCallbackBadge (tabId, param)
{
	var count = param.count;
	try {
		var badgeText = ''+count;
		tabBadgeMap[tabId] = badgeText;
		chrome.browserAction.setBadgeText({
			text: badgeText,
			tabId: tabId
		});
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
function getAppliedRules (callback) 
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
var rulePickerSrc = '';
var smartRuleEditorSrc = '';
function loadRulePickerSrc()
{
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function()
	{
		if (xhr.readyState==4) 
		{
			if (xhr.status==0 || xhr.status==200) 
			{
				rulePickerSrc = xhr.responseText;
				loadSmartRuleEditorSrc();
			}
		}
	}
	xhr.open("GET", chrome.extension.getURL('/rule_editor_'+chrome.i18n.getMessage("extLocale")+'.html'), true);
	xhr.send();
}
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

var SaveRuleTask = function (rule, reloadLists, tabId) 
{
	var saveWords = new Array();
	var deleteWords = new Array();
	
	for (var i=0, l=rule.words.length; i<l; i++) 
	{
		var word = rule.words[i];
		if (word.isNew) 
		{
			saveWords.push(word);
		}
		else if (word.deleted) 
		{
			deleteWords.push(word);
		}
	}
	
	this.rule = rule;
	this.tabId = tabId;
	
	this.saveWords = saveWords;
	this.deleteWords = deleteWords;
	
	this.reloadLists /* function */ = reloadLists;
};
SaveRuleTask.prototype.exec = function (nextAction) 
{
	//peer, wordPeer
	peer.saveObject(this.rule, this.getNextTask(nextAction));	
};
SaveRuleTask.prototype.getNextTask = function (nextAction) 
{
	var self = this;
	return function () 
	{
		var nextSaveWord = self.getNextSaveWord();
		if (nextSaveWord) 
		{
			wordPeer.saveObject(nextSaveWord, self.getNextTask(nextAction));
			return;
		}
		var nextDeleteWord = self.getNextDeleteWord();
		if (nextDeleteWord) 
		{
			wordPeer.deleteObject(nextDeleteWord, self.getNextTask(nextAction));
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
};
SaveRuleTask.prototype.getNextSaveWord = function () 
{
	for (var i=0, l=this.saveWords.length; i<l; i++) 
	{
		var word = this.saveWords[i];
		if (word.dirty) 
		{
			word.rule_id = this.rule.rule_id;
			return word;
		}
	}
	return null;
};
SaveRuleTask.prototype.getNextDeleteWord = function () 
{
	for (var i=0, l=this.deleteWords.length; i<l; i++) 
	{
		var word = this.deleteWords[i];
		if (word.dirty) 
		{
			word.rule_id = this.rule.rule_id;
			return word;
		}
	}
};

var ruleList = new Array();
var appliedRuleMap = new Array();
if (!chrome.tabs.customBlockerOnUpdateSet)
{
	chrome.tabs.onUpdated.addListener(tabOnUpdate);
	chrome.tabs.onRemoved.addListener
		(function(tabId, removeInfo) 
			{
				removeFromExistingTabList(tabId);
				appliedRuleMap[tabId] = null;
			});
	chrome.tabs.onSelectionChanged.addListener
		(function(_tabId, selectInfo) 
			{
				var tabId = parseInt(_tabId);
				for (var _index in existingTabs) 
				{ 
					var tabIdToDisable = parseInt(_index);
					if (tabIdToDisable && tabIdToDisable!=tabId)
					{
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
						chrome.browserAction.setBadgeText({
							text: tabBadgeMap[tabId],
							tabId: tabId
						});
					}
				}
				catch (ex) {console.log(ex);}
			});
}
function setIconDisabled (isDisabled) 
{
	chrome.tabs.getSelected(null,function(tab)
	{
		_setIconDisabled(isDisabled,tab.id);
	});
}
function _setIconDisabled (isDisabled, tabId)
{
	chrome.browserAction.setBadgeText({
		text:(isDisabled)?'OFF':'',
		tabId: tabId
	});
	chrome.browserAction.setIcon(
	{
		path:(isDisabled)?'icon_disabled.png':'icon.png',
		tabId:tabId
	});	
	
}
function highlightRuleElements (rule)
{
	chrome.tabs.getSelected(null,function(tab)
		{
			chrome.tabs.sendRequest(tab.id, 
				{
					command: 'highlight',
					rule: rule
				}, getForegroundCallback(tab.id));
		});
}
function getBadgeTooltipString (count)
{
	if (count > 1)
		return chrome.i18n.getMessage("tooltipCount").replace("__count__",count);
	else
		return chrome.i18n.getMessage("tooltipCountSingle");
}
chrome.tabs.customBlockerOnUpdateSet = true;
onStart();

function onRightClick(clicked, tab) {
	chrome.tabs.sendRequest(
		tab.id, 
		{
			command: 'quickRuleCreation',
			src: smartRuleEditorSrc,
			appliedRuleList: appliedRuleMap[tab.id],
			selectionText: clicked.selectionText
		}, 
		getForegroundCallback(tab.id)
	);
}

var menuId = chrome.contextMenus.create({"title": chrome.i18n.getMessage('menuCreateRule'), "contexts":["selection"],
	"onclick": onRightClick});
