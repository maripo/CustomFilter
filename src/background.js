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
function loadLists () 
{
	peer.select('', 
		onRuleListLoaded, null);
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
				smartRuleEditorSrc: smartRuleEditorSrc,
				rule: selectedRule,
				appliedRuleList: appliedRuleMap[tab.id]
			}, getRulePickerOnCommandFunc(tab.id));
		});
	} 
	catch (ex) {console.log(ex)}
}
function getRulePickerOnCommandFunc (tabId)
{
	return function (command)
	{
		try 
		{
			var exPeer;
			if ('save' == command.command) 
			{
				var rule =command.obj;
				var saveRuleTask = new SaveRuleTask(rule, reloadLists, tabId);
				saveRuleTask.exec();
			}
				
			if ('delete' == command.command) 
			{
				exPeer.deleteObject(command.obj, reloadLists);
			}
		} 
		catch (e) 
		{
			console.log(e)
		}
		chrome.tabs.getSelected(null,function(tab)
		{
			chrome.tabs.sendRequest(tab.id, 
			{
				command: 'ruleEditorRegister'
			}, getRulePickerOnCommandFunc(tab.id));
		});
		
	}
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
	if (url !== undefined && changeInfo.status == "complete") 
	{
		chrome.tabs.sendRequest(tabId,
		{
			command:'init',
			rules: ruleList,
			tabId: tabId
		},
		function(list)
		{
			try {
				chrome.browserAction.setIcon(
					{
						path:((list.length>0)?'icon.png':'icon_disabled.png'),
						tabId:tabId
					});
			} catch (ex) 
			{
				console.log(ex)
			}
			appliedRuleMap[tab.id] = list;
			chrome.tabs.sendRequest(tab.id, 
			{
				command: 'badge'
			}, getBadgeAction(tabId));
		});
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
	//すべてがおわったらreloadListsを実行する				
};
SaveRuleTask.prototype.exec = function () 
{
	//peer, wordPeer
	peer.saveObject(this.rule, this.getNextTask());	
};
SaveRuleTask.prototype.getNextTask = function () 
{
	var self = this;
	return function () 
	{
		var nextSaveWord = self.getNextSaveWord();
		if (nextSaveWord) 
		{
			wordPeer.saveObject(nextSaveWord, self.getNextTask());
			return;
		}
		var nextDeleteWord = self.getNextDeleteWord();
		if (nextDeleteWord) 
		{
			wordPeer.deleteObject(nextDeleteWord, self.getNextTask());
			return;
		}
		chrome.tabs.sendRequest(self.tabId,
		{
			command:'ruleSaveDone',
			rules: ruleList,
			tabId: self.tabId,
			rule: self.rule
		}
		, getRulePickerOnCommandFunc(self.tabId)
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
				var isDisabled = ('true' == localStorage.blockDisabled);
				_setIconDisabled(isDisabled, tabId);
				var ids = new Array();
				for (var _index in existingTabs) 
				{ 
					var index = parseInt(_index);
					if (existingTabs[index] && index!=tabId)
					{
						chrome.tabs.sendRequest(index, 
							{
								command: 'stop'
							}, getBadgeAction(index));
					}
						ids.push(index);
				}
				try
				{
					chrome.tabs.sendRequest(tabId, 
						{
							command: 'resume'
						}, getBadgeAction(tabId));
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
function getBadgeAction (tabId) 
{
	return function (params) 
	{
		var count = params.count;
		var rules = params.rules;
		try 
		{
			appliedRuleMap[tabId] = rules;
			var badgeText = ''+count;
			chrome.browserAction.setBadgeText({
				text: badgeText,
				tabId: tabId
			});
			tabBadgeMap[tabId] = badgeText;
			chrome.browserAction.setTitle({
				title: getBadgeTooltipString(count),
				tabId:tabId
			});
		} catch (ex) {
			console.log(ex)
		}
		chrome.tabs.sendRequest(tabId, {
			command: 'badge'
		}, getBadgeAction(tabId));
	}
};
function highlightRuleElements (rule)
{
	chrome.tabs.getSelected(null,function(tab)
		{
			chrome.tabs.sendRequest(tab.id, 
				{
					command: 'highlight',
					rule: rule
				}, getBadgeAction(tab.id));
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
				src: rulePickerSrc,
				smartRuleEditorSrc: smartRuleEditorSrc,
				appliedRuleList: appliedRuleMap[tab.id]
			}
				
		);
}

var contexts = ["all"];
for (var i = 0; i < contexts.length; i++) {
	var context = contexts[i];
	var menuId = chrome.contextMenus.create({"title": "Create Rule", "contexts":[context],
	                                    "onclick": onRightClick});
}
