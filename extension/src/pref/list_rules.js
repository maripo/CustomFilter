var allRules = [];
var ruleContainerList = new Array();
var ruleEditor;
function manualMigration() {
    chrome.storage.local.get(["migrationDone"], function (result) {
        if (!result["migrationDone"]) {
            document.getElementById("manualMigrationSection").style.display = "block";
            document.getElementById("manualMigrationLink").addEventListener("click", function () {
                var bgWindow = chrome.extension.getBackgroundPage();
                bgWindow.manualDataMigration();
            }, false);
        }
    });
}
function onStart() {
    document.getElementById('help_link').setAttribute("href", 'help_' + chrome.i18n.getMessage('extLocale') + '.html');
    document.getElementById('donate_link').setAttribute("href", 'help_' + chrome.i18n.getMessage('extLocale') + '.html#donate');
    document.getElementById('help_link_empty').setAttribute("href", 'help_' + chrome.i18n.getMessage('extLocale') + '.html');
    document.getElementById('search_box').addEventListener('change', search, false);
    document.getElementById('search_box').addEventListener('keyup', search, false);
    document.getElementById('rule_editor_radio_search_xpath').addEventListener('change', refreshPathSections, false);
    document.getElementById('rule_editor_radio_search_css').addEventListener('change', refreshPathSections, false);
    document.getElementById('rule_editor_radio_hide_xpath').addEventListener('change', refreshPathSections, false);
    document.getElementById('rule_editor_radio_hide_css').addEventListener('change', refreshPathSections, false);
    document.getElementById('buttonBadgeOn').addEventListener('change', refreshBadgeEnabled, false);
    document.getElementById('buttonBadgeOff').addEventListener('change', refreshBadgeEnabled, false);
    if ("true" == localStorage.badgeDisabled) {
        document.getElementById('buttonBadgeOff').setAttribute("checked", "true");
    }
    else {
        document.getElementById('buttonBadgeOn').setAttribute("checked", "true");
    }
    ruleEditor = new PrefRuleEditor();
    CustomBlockerUtil.processPage();
    ruleEditor.init();
    window.setTimeout(manualMigration, 1000);
}
function refreshBadgeEnabled() {
    var isBadgeOn = document.getElementById('buttonBadgeOn').checked;
    localStorage.badgeDisabled = (isBadgeOn) ? "false" : "true";
}
function showEmptyAlert() {
    document.getElementById('js_rule-list').style.display = 'none';
    document.getElementById('ruleEmptyAlert').style.display = 'block';
}
function hideEmptyAlert() {
    document.getElementById('js_rule-list').style.display = 'block';
    document.getElementById('ruleEmptyAlert').style.display = 'none';
}
var prevFilterString = null;
function renderRules() {
    for (var _i = 0, ruleContainerList_1 = ruleContainerList; _i < ruleContainerList_1.length; _i++) {
        var container = ruleContainerList_1[_i];
        var element = container.getLiElement();
        container.applyClassName();
        document.getElementById('js_rule-list').appendChild(element);
    }
}
function search() {
    applyFilter(document.getElementById('search_box').value);
}
function applyFilter(filterString) {
    if (prevFilterString == filterString)
        return;
    prevFilterString = filterString;
    for (var i = 0, l = ruleContainerList.length; i < l; i++) {
        var container = ruleContainerList[i];
        var matched = isMatched(container.rule, filterString);
        container.filtered = !matched;
        container.applyClassName();
    }
    showCount();
}
function showCount() {
    var visibleCount = 0;
    for (var i = 0, l = ruleContainerList.length; i < l; i++) {
        if (!ruleContainerList[i].filtered)
            visibleCount++;
    }
    document.getElementById('activeRuleCount').innerHTML = String(visibleCount);
    document.getElementById('totalRuleCount').innerHTML = String(ruleContainerList.length);
}
function isMatched(rule, filterString) {
    if (null == filterString || '' == filterString)
        return true;
    filterString = filterString.toLowerCase();
    return (isMatchedByRule(rule, filterString) || isMatchedByWords(rule, filterString));
}
function isMatchedByRule(rule, filterString) {
    return (rule.title.toLowerCase().indexOf(filterString) >= 0 ||
        rule.site_regexp.toLowerCase().indexOf(filterString) >= 0 ||
        rule.example_url.toLowerCase().indexOf(filterString) >= 0);
}
function isMatchedByWords(rule, filterString) {
    if (!rule.words)
        return false;
    for (var i = 0; i < rule.words.length; i++) {
        if (rule.words[i].word.toLowerCase().indexOf(filterString) >= 0)
            return true;
    }
    return false;
}
function deselectAll() {
    for (var _i = 0, ruleContainerList_2 = ruleContainerList; _i < ruleContainerList_2.length; _i++) {
        var container = ruleContainerList_2[_i];
        container.deselect();
        container.applyClassName();
    }
}
function removeElement(element) {
    for (var i = 0; i < ruleContainerList.length; i++) {
        if (ruleContainerList[i] == element) {
            ruleContainerList.splice(i, 1);
            return;
        }
    }
}
var RuleContainer = (function () {
    function RuleContainer(rule) {
        this.rule = rule;
        this.liElement = null;
        this.filtered = false;
    }
    RuleContainer.prototype.deselect = function () {
        this.selected = false;
    };
    RuleContainer.prototype.applyClassName = function () {
        this.liElement.className = (this.filtered) ? 'rule-list__item rule-list__item--filtered filtered' : 'rule-list__item';
    };
    RuleContainer.prototype.getLiElement = function () {
        var _this = this;
        if (this.liElement)
            return this.liElement;
        this.liElement = document.createElement('LI');
        var exampleLink = document.createElement('INPUT');
        exampleLink.className = 'uiButton exampleUrl';
        exampleLink.setAttribute("value", "link");
        exampleLink.setAttribute("type", "button");
        exampleLink.addEventListener("click", function () {
            window.open(_this.rule.example_url);
        });
        this.liElement.addEventListener('click', this.getSelectAction(), false);
        var buttonContainer = document.createElement('DIV');
        buttonContainer.className = 'button-container';
        buttonContainer.appendChild(exampleLink);
        buttonContainer.appendChild(this.createSelectButton());
        buttonContainer.appendChild(this.createDeleteButton());
        this.disableBox = this.createDisableBox();
        buttonContainer.appendChild(this.disableBox);
        this.liElement.appendChild(buttonContainer);
        var informationDiv = document.createElement('DIV');
        informationDiv.className = 'rule-list__item__information';
        this.liElement.appendChild(informationDiv);
        var titleDiv = document.createElement('DIV');
        titleDiv.className = 'title';
        titleDiv.innerHTML = CustomBlockerUtil.shorten(this.rule.title, 42);
        var urlDiv = document.createElement('DIV');
        urlDiv.className = 'url';
        urlDiv.innerHTML = CustomBlockerUtil.shorten(this.rule.site_regexp, 36);
        var keywordsDiv = document.createElement('DIV');
        keywordsDiv.className = 'keywords';
        var keywords = new Array();
        if (this.rule.block_anyway) {
            var span = document.createElement('SPAN');
            span.innerHTML = chrome.i18n.getMessage('blockAnyway');
            span.className = 'keyword blockAnyway';
            keywordsDiv.appendChild(span);
        }
        else {
            for (var _i = 0, _a = this.rule.words; _i < _a.length; _i++) {
                var word = _a[_i];
                var keywordSpan = document.createElement('SPAN');
                keywordSpan.className = (word.is_regexp) ? "keyword keyword--regex" : "keyword keyword--normal";
                keywordSpan.innerHTML = word.word;
                keywordsDiv.appendChild(keywordSpan);
                keywordsDiv.appendChild(document.createTextNode(" "));
            }
            for (var _b = 0, _c = this.rule.wordGroups; _b < _c.length; _b++) {
                var group = _c[_b];
                var keywordSpan = document.createElement('SPAN');
                keywordSpan.className = "keyword keyword--group";
                keywordSpan.innerHTML = group.name;
                keywordsDiv.appendChild(keywordSpan);
                keywordsDiv.appendChild(document.createTextNode(" "));
            }
        }
        informationDiv.appendChild(titleDiv);
        informationDiv.appendChild(urlDiv);
        informationDiv.appendChild(keywordsDiv);
        var favicon = document.createElement('IMG');
        var hrefValue = (this.rule.example_url) ? 'chrome://favicon/' + this.rule.example_url : chrome.extension.getURL('img/world.png');
        favicon.setAttribute("src", hrefValue);
        favicon.className = 'favicon';
        informationDiv.appendChild(favicon);
        return this.liElement;
    };
    RuleContainer.prototype.createDisableBox = function () {
        var span = document.createElement('SPAN');
        var input = document.createElement('INPUT');
        input.type = 'BUTTON';
        input.value = (this.rule.is_disabled) ? 'OFF' : 'ON';
        input.className = (this.rule.is_disabled) ? 'uiButton buttonOff' : 'uiButton buttonOn';
        span.appendChild(input);
        input.addEventListener('click', this.getDisableAction(input), true);
        return span;
    };
    RuleContainer.prototype.createSelectButton = function () {
        var button = document.createElement('INPUT');
        button.type = 'BUTTON';
        button.className = 'uiButton buttonEdit';
        button.value = chrome.i18n.getMessage('buttonLabelEdit');
        button.addEventListener('click', this.getSelectAction(), true);
        return button;
    };
    RuleContainer.prototype.createDeleteButton = function () {
        var button = document.createElement('INPUT');
        button.type = 'BUTTON';
        button.className = 'uiButton buttonDelete';
        button.value = chrome.i18n.getMessage('buttonLabelDelete');
        button.addEventListener('click', this.getDeleteAction(), true);
        return button;
    };
    RuleContainer.prototype.getDisableAction = function (inputButton) {
        var _this = this;
        return function (event) {
            event.stopPropagation();
            var rule = _this.rule;
            cbStorage.toggleRule(rule, function () {
                inputButton.value = (rule.is_disabled) ? 'OFF' : 'ON';
                inputButton.className = (rule.is_disabled) ? 'uiButton buttonOff' : 'uiButton buttonOn';
            });
        };
    };
    RuleContainer.prototype.getSelectAction = function () {
        var _this = this;
        return function (event) {
            document.getElementById('rule_editor_alert').style.display = 'none';
            ruleEditor.selectRule(_this.rule);
            deselectAll();
            _this.selected = true;
            _this.applyClassName();
        };
    };
    RuleContainer.prototype.getDeleteAction = function () {
        var _this = this;
        return function (event) {
            event.stopPropagation();
            if (window.confirm(chrome.i18n.getMessage('dialogDelete'))) {
                cbStorage.deleteRule(_this.rule, function () { });
                _this.liElement.parentNode.removeChild(_this.liElement);
                removeElement(_this);
                showCount();
                reloadBackground();
            }
        };
    };
    return RuleContainer;
}());
function refreshPathSections() {
    var hideByXPath = document.getElementById('rule_editor_radio_hide_xpath').checked;
    var searchByXPath = document.getElementById('rule_editor_radio_search_xpath').checked;
    document.getElementById('rule_editor_section_hide_xpath').style.display = (hideByXPath) ? 'block' : 'none';
    document.getElementById('rule_editor_section_hide_css').style.display = (hideByXPath) ? 'none' : 'block';
    document.getElementById('rule_editor_section_search_xpath').style.display = (searchByXPath) ? 'block' : 'none';
    document.getElementById('rule_editor_section_search_css').style.display = (searchByXPath) ? 'none' : 'block';
}
;
var reloadBackground = function () {
    try {
        var bgWindow = chrome.extension.getBackgroundPage();
        bgWindow.reloadLists();
    }
    catch (ex) {
        alert(ex);
    }
};
var PrefRuleEditor = (function () {
    function PrefRuleEditor() {
        this.rule = null;
        this.saveButton = document.getElementById('rule_editor_save_button');
        this.saveButton.addEventListener('click', this.getSaveAction(), true);
        this.alertDiv = document.getElementById('rule_editor_alert');
        document.getElementById('rule_editor_block_anyway').addEventListener('change', PrefRuleEditor.setVisibilityOfConditionDetail, false);
        document.getElementById('rule_editor_block_anyway_false').addEventListener('change', PrefRuleEditor.setVisibilityOfConditionDetail, false);
        this.wordEditor = new WordEditor();
        var self = this;
        this.wordEditor.addWordHandler = function (word) {
            word.rule_id = self.rule.rule_id;
            cbStorage.addWordToRule(self.rule, word);
        };
        this.wordEditor.deleteWordHandler = function (word) {
            cbStorage.removeWordFromRule(self.rule, word);
        };
    }
    PrefRuleEditor.prototype.init = function () {
        var _this = this;
        var self = this;
        this.group_picker = new WordGroupPicker(document.getElementById("select_word_groups"));
        this.group_picker.onSelectGroup = function (group) {
            console.log("list_rules group selected.");
            _this.rule.wordGroups.push(group);
            _this.renderGroups(_this.rule.wordGroups);
            _this.group_picker.refresh();
        };
        cbStorage.loadAll(function (rules, groups) {
            if (!rules || rules.length == 0) {
                showEmptyAlert();
            }
            allRules = rules;
            self.wordGroups = groups;
            for (var i = 0; i < allRules.length; i++) {
                ruleContainerList.push(new RuleContainer(allRules[i]));
            }
            self.group_picker.setGroups(groups);
            self.group_picker.refresh();
            renderRules();
            showCount();
        });
    };
    PrefRuleEditor.prototype.removeGroup = function (group) {
        for (var groupId = 0; groupId < this.rule.wordGroups.length; groupId++) {
            if (this.rule.wordGroups[groupId].global_identifier == group.global_identifier) {
                this.rule.wordGroups.splice(groupId, 1);
                this.renderGroups(this.rule.wordGroups);
                this.group_picker.refresh();
                return;
            }
        }
    };
    PrefRuleEditor.prototype.renderGroups = function (groups) {
        var _this = this;
        document.getElementById("rule_editor_keyword_groups").innerHTML = "";
        groups.forEach(function (group) {
            CustomBlockerUtil.createWordGroupElement(group, function () { _this.removeGroup(group); });
            document.getElementById("rule_editor_keyword_groups").appendChild(CustomBlockerUtil.createWordGroupElement(group, function () { _this.removeGroup(group); }));
        });
    };
    PrefRuleEditor.setVisibilityOfConditionDetail = function () {
        document.getElementById('rule_editor_hide_detail').style.display =
            (document.getElementById('rule_editor_block_anyway').checked) ? 'none' : 'block';
    };
    PrefRuleEditor.prototype.getSaveAction = function () {
        var self = this;
        return function () {
            self.saveRule();
        };
    };
    PrefRuleEditor.prototype.selectRule = function (rule) {
        this.rule = rule;
        this.wordEditor.setWords(rule.words);
        document.getElementById('rule_editor_title').value = rule.title;
        document.getElementById('rule_editor_site_regexp').value = rule.site_regexp;
        document.getElementById('rule_editor_example_url').value = rule.example_url;
        document.getElementById('rule_editor_search_block_xpath').value = rule.search_block_xpath;
        document.getElementById('rule_editor_search_block_css').value = rule.search_block_css;
        var searchRadio = document.getElementById('rule_editor_radio_search_' + ((rule.search_block_by_css) ? 'css' : 'xpath'));
        searchRadio.checked = true;
        document.getElementById('rule_editor_hide_block_xpath').value = rule.hide_block_xpath;
        document.getElementById('rule_editor_hide_block_css').value = rule.hide_block_css;
        var hideRadio = document.getElementById('rule_editor_radio_hide_' + ((rule.hide_block_by_css) ? 'css' : 'xpath'));
        hideRadio.checked = true;
        var blockAnywayCheckbox = document.getElementById((rule.block_anyway) ? 'rule_editor_block_anyway' : 'rule_editor_block_anyway_false');
        blockAnywayCheckbox.checked = true;
        document.getElementById('rule_editor_hide_detail').style.display = (rule.block_anyway) ? 'none' : 'block';
        document.getElementById('specify_url_by_regexp_checkbox').checked = rule.specify_url_by_regexp;
        var select = document.getElementById("select_word_groups");
        var self = this;
        select.addEventListener("change", function () {
            var value = select.getElementsByTagName("option")[select.selectedIndex].value;
            console.log(select.selectedIndex);
        });
        this.group_picker.setRule(this.rule);
        this.group_picker.refresh();
        this.renderGroups(this.rule.wordGroups);
        refreshPathSections();
    };
    PrefRuleEditor.prototype.renderGroups = function (groups) {
        var _this = this;
        document.getElementById("rule_editor_keyword_groups").innerHTML = "";
        groups.forEach(function (group) {
            CustomBlockerUtil.createWordGroupElement(group, function () { _this.removeGroup(group); });
            document.getElementById("rule_editor_keyword_groups").appendChild(CustomBlockerUtil.createWordGroupElement(group, function () { _this.removeGroup(group); }));
        });
    };
    PrefRuleEditor.prototype.createOption = function (label, value) {
        var option = document.createElement("option");
        option.innerHTML = label;
        if (value) {
            option.value = value;
        }
        return option;
    };
    PrefRuleEditor.prototype.showMessage = function (str) {
        this.alertDiv.style.display = 'block';
        this.alertDiv.innerHTML = str;
    };
    PrefRuleEditor.prototype.hideMessage = function () {
        this.alertDiv.style.display = 'none';
    };
    PrefRuleEditor.prototype.saveRule = function () {
        var validateErrors = cbStorage.validateRule({
            title: document.getElementById('rule_editor_title').value,
            site_regexp: document.getElementById('rule_editor_site_regexp').value,
            example_url: document.getElementById('rule_editor_example_url').value,
            search_block_xpath: document.getElementById('rule_editor_search_block_xpath').value,
            search_block_css: document.getElementById('rule_editor_search_block_css').value,
            hide_block_xpath: document.getElementById('rule_editor_hide_block_xpath').value,
            hide_block_css: document.getElementById('rule_editor_hide_block_css').value,
        });
        if (validateErrors.length > 0) {
            this.showMessage(validateErrors.join('<br/>'));
            return;
        }
        this.rule.title = document.getElementById('rule_editor_title').value;
        this.rule.site_regexp = document.getElementById('rule_editor_site_regexp').value;
        this.rule.example_url = document.getElementById('rule_editor_example_url').value;
        this.rule.search_block_xpath = document.getElementById('rule_editor_search_block_xpath').value;
        this.rule.search_block_css = document.getElementById('rule_editor_search_block_css').value;
        this.rule.search_block_by_css = document.getElementById('rule_editor_radio_search_css').checked;
        this.rule.hide_block_xpath = document.getElementById('rule_editor_hide_block_xpath').value;
        this.rule.hide_block_css = document.getElementById('rule_editor_hide_block_css').value;
        this.rule.hide_block_by_css = document.getElementById('rule_editor_radio_hide_css').checked;
        this.rule.block_anyway = document.getElementById('rule_editor_block_anyway').checked;
        this.rule.specify_url_by_regexp = document.getElementById('specify_url_by_regexp_checkbox').checked;
        var self = this;
        cbStorage.saveRule(this.rule, function () {
            hideEmptyAlert();
            self.showMessage(chrome.i18n.getMessage('saveDone'));
            reloadBackground();
        });
    };
    return PrefRuleEditor;
}());
window.onload = onStart;
//# sourceMappingURL=list_rules.js.map