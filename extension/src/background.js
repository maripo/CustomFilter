var initDone = false;
var existingTabs = new Array();
var tabBadgeMap = new Array();
var ruleList = [];
function onStartBackground() {
    updateDbIfNeeded(createRuleTable);
}
function removeFromExistingTabList(tabIdToRemove) {
    for (var id in existingTabs) {
        if (tabIdToRemove == id)
            existingTabs[id] = null;
    }
}
function addToExistingTabList(tabIdToAdd) {
    existingTabs[tabIdToAdd] = true;
}
function reloadLists() {
    console.log("reloadLists");
    loadLists();
}
function openRulePicker(selectedRule) {
    var status = (selectedRule) ? 'edit' : 'create';
    Analytics.trackEvent('openRulePicker', status);
    try {
        chrome.tabs.getSelected(null, function (tab) {
            var tabInfo = tabMap[tab.id];
            if (!tabInfo) {
                return;
            }
            var appliedRules = (tabInfo) ? tabInfo.appliedRules : [];
            tabInfo.postMessage({
                command: 'ruleEditor',
                rule: selectedRule,
                appliedRuleList: appliedRules
            });
        });
    }
    catch (ex) {
        console.log(ex);
    }
}
chrome.extension.onRequest.addListener(function (request, sender) {
    if (request.command == "requestRules") {
        tabOnUpdate(sender.tab.id, null, sender.tab);
    }
});
var CustomBlockerTab = (function () {
    function CustomBlockerTab(tabId, tab) {
        this.tabId = tab.id;
        this.url = tab.url;
        this.appliedRules = [];
        this.port = chrome.tabs.connect(tabId, {});
        var self = this;
        this.port.onMessage.addListener(function (msg) {
            self.onMessage(msg);
        });
    }
    CustomBlockerTab.prototype.execCallbackDb = function (param) {
        console.log("TODO execCallbackDb");
    };
    CustomBlockerTab.prototype.execCallbackSetApplied = function (param) {
        this.appliedRules = param.list;
        var iconPath = "icon/" + ((this.appliedRules.length > 0) ? 'icon.png' : 'icon_disabled.png');
        try {
            chrome.browserAction.setIcon({
                path: iconPath,
                tabId: this.tabId
            });
        }
        catch (ex) {
            console.log(ex);
        }
    };
    CustomBlockerTab.prototype.execCallbackBadge = function (param) {
        var count = param.count;
        try {
            var badgeText = '' + count;
            tabBadgeMap[this.tabId] = badgeText;
            if (localStorage.badgeDisabled != "true") {
                chrome.browserAction.setBadgeText({
                    text: badgeText,
                    tabId: this.tabId
                });
            }
            chrome.browserAction.setTitle({
                title: getBadgeTooltipString(count),
                tabId: this.tabId
            });
            this.appliedRules = param.rules;
        }
        catch (ex) {
            console.log(ex);
        }
    };
    CustomBlockerTab.prototype.postMessage = function (message) {
        try {
            this.port.postMessage(message);
        }
        catch (e) {
            console.log(e);
        }
    };
    CustomBlockerTab.prototype.onMessage = function (message) {
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
    };
    CustomBlockerTab.postMessage = function (tabId, message) {
        var tabInfo = tabMap[tabId];
        if (!tabInfo) {
            console.log("CustomBlockerTab.postMessage tab not found.");
            return;
        }
        tabInfo.postMessage(message);
    };
    CustomBlockerTab.postMessageToAllTabs = function (message) {
        for (var tabId in tabMap) {
            CustomBlockerTab.postMessage(tabId, message);
        }
    };
    return CustomBlockerTab;
}());
var tabMap = {};
var tabOnUpdate = function (tabId, changeInfo, tab) {
    addToExistingTabList(tabId);
    var isDisabled = ('true' == localStorage.blockDisabled);
    _setIconDisabled(isDisabled, tabId);
    if (isDisabled) {
        return;
    }
    var url = tab.url;
    if (isValidURL(url)) {
        tabMap[tabId] = new CustomBlockerTab(tabId, tab);
        tabMap[tabId].postMessage({
            command: 'init',
            rules: ruleList,
            tabId: tabId
        });
    }
};
var VALID_URL_REGEX = new RegExp('^https?:');
function isValidURL(url) {
    return url != null && VALID_URL_REGEX.test(url);
}
function getForegroundCallback(tabId) {
    return function (param) {
    };
}
;
function handleForegroundMessage(tabId, param) {
    console.log("Foreground message received.");
    console.log(param);
    if (!param)
        return;
    var useCallback = false;
    switch (param.command) {
        case 'badge':
            break;
        case 'setApplied':
            break;
        case 'notifyUpdate':
            break;
    }
}
function getAppliedRules(callback) {
    chrome.tabs.getSelected(null, function (tab) {
        try {
            var appliedRules = (tabMap[tab.id]) ? tabMap[tab.id].appliedRules : [];
            callback(appliedRules);
        }
        catch (ex) {
            console.log(ex);
        }
    });
}
var smartRuleEditorSrc = '';
function loadSmartRuleEditorSrc() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 0 || xhr.status == 200) {
                smartRuleEditorSrc = xhr.responseText;
            }
        }
    };
    xhr.open("GET", chrome.extension.getURL('/smart_rule_editor_' + chrome.i18n.getMessage("extLocale") + '.html'), true);
    xhr.send();
}
{
    chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
        removeFromExistingTabList(tabId);
        tabMap[tabId] = null;
    });
    chrome.tabs.onSelectionChanged.addListener(function (_tabId, selectInfo) {
        var tabId = _tabId;
        for (var _index in existingTabs) {
            var tabIdToDisable = parseInt(_index);
            if (tabIdToDisable && tabIdToDisable != tabId) {
                CustomBlockerTab.postMessage(tabIdToDisable, { command: 'stop' });
            }
        }
        try {
            if ('true' == localStorage.blockDisabled)
                _setIconDisabled(!applied, tabId);
            else {
                var appliedRules = (tabMap[tabId]) ? tabMap[tabId].appliedRules : [];
                var applied = appliedRules.length > 0;
                var iconPath = "icon/" + ((applied) ? 'icon.png' : 'icon_disabled.png');
                chrome.browserAction.setIcon({
                    path: iconPath,
                    tabId: tabId
                });
            }
            CustomBlockerTab.postMessage(tabId, { command: 'resume' });
            if (tabBadgeMap[tabId]) {
                if (localStorage.badgeDisabled != "true") {
                    chrome.browserAction.setBadgeText({
                        text: tabBadgeMap[tabId],
                        tabId: tabId
                    });
                }
            }
        }
        catch (ex) {
            console.log(ex);
        }
    });
}
function setIconDisabled(isDisabled) {
    chrome.tabs.getSelected(null, function (tab) {
        _setIconDisabled(isDisabled, tab.id);
    });
}
function _setIconDisabled(isDisabled, tabId) {
    if (localStorage.badgeDisabled != "true") {
        chrome.browserAction.setBadgeText({
            text: (isDisabled) ? 'OFF' : '',
            tabId: tabId
        });
    }
    var iconPath = "icon/" + ((isDisabled) ? 'icon_disabled.png' : 'icon.png');
    chrome.browserAction.setIcon({
        path: iconPath,
        tabId: tabId
    });
}
function highlightRuleElements(rule) {
    chrome.tabs.getSelected(null, function (tab) {
        CustomBlockerTab.postMessage(tab.id, {
            command: 'highlight',
            rule: rule
        });
    });
}
function getBadgeTooltipString(count) {
    if (count > 1)
        return chrome.i18n.getMessage("tooltipCount").replace("__count__", count);
    else
        return chrome.i18n.getMessage("tooltipCountSingle");
}
function menuCreateOnRightClick(clicked, tab) {
    sendQuickRuleCreationRequest(clicked, tab, true);
    Analytics.trackEvent('contextMenu', 'create');
}
;
function menuAddOnRightClick(clicked, tab) {
    sendQuickRuleCreationRequest(clicked, tab, false);
    Analytics.trackEvent('contextMenu', 'add');
}
;
function sendQuickRuleCreationRequest(clicked, tab, needSuggestion) {
    var appliedRules = (tabMap[tab.id]) ? tabMap[tab.id].appliedRules : [];
    CustomBlockerTab.postMessage(tab.id, {
        command: 'quickRuleCreation',
        src: smartRuleEditorSrc,
        appliedRuleList: appliedRules,
        selectionText: clicked.selectionText,
        needSuggestion: needSuggestion
    });
}
;
var menuIdCreate = chrome.contextMenus.create({ "title": chrome.i18n.getMessage('menuCreateRule'), "contexts": ["selection"],
    "onclick": menuCreateOnRightClick });
var menuIdAdd = chrome.contextMenus.create({ "title": chrome.i18n.getMessage('menuAddToExistingRule'), "contexts": ["selection"],
    "onclick": menuAddOnRightClick });
chrome.runtime.onInstalled.addListener(function (details) {
    console.log("reason=" + details.reason);
    console.log("previousVersion=" + details.previousVersion);
    if ("install" == details.reason) {
        console.log("New install.");
        window.open(chrome.extension.getURL('/welcome_install_' + chrome.i18n.getMessage("extLocale") + '.html?install'));
    }
    else if (details.reason == "update" && details.previousVersion && details.previousVersion.match(/^2\./)) {
        window.open(chrome.extension.getURL('/welcome_' + chrome.i18n.getMessage("extLocale") + '.html'));
    }
});
window.onload = function () {
    onStartBackground();
};
chrome.storage.onChanged.addListener(function (changes, namespace) {
    cbStorage.sync(changes, namespace, function () {
        cbStorage.loadAll(function (rules, groups) {
            CustomBlockerTab.postMessageToAllTabs({ command: 'reload', rules: rules });
        });
    });
});
//# sourceMappingURL=background.js.map