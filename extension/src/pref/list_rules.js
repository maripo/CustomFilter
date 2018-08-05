var allRules = [];
var ruleContainerList = new Array();
var ruleEditor;
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
    CustomBlockerUtil.localize();
    cbStorage.loadAll(function (rules) {
        if (!rules || rules.length == 0) {
            showEmptyAlert();
        }
        allRules = rules;
        for (var i = 0; i < allRules.length; i++) {
            ruleContainerList.push(new RuleContainer(allRules[i]));
        }
        renderRules();
        showCount();
    });
}
function refreshBadgeEnabled() {
    var isBadgeOn = document.getElementById('buttonBadgeOn').checked;
    localStorage.badgeDisabled = (isBadgeOn) ? "false" : "true";
}
function showEmptyAlert() {
    document.getElementById('ruleList').style.display = 'none';
    document.getElementById('ruleEmptyAlert').style.display = 'block';
}
function hideEmptyAlert() {
    document.getElementById('ruleList').style.display = 'block';
    document.getElementById('ruleEmptyAlert').style.display = 'none';
}
var prevFilterString = null;
function renderRules() {
    for (var i = 0, l = ruleContainerList.length; i < l; i++) {
        var container = ruleContainerList[i];
        var element = container.getLiElement();
        container.applyClassName(i);
        document.getElementById('ruleList').appendChild(element);
    }
}
function search() {
    applyFilter(document.getElementById('search_box').value);
}
function applyFilter(filterString) {
    if (prevFilterString == filterString)
        return;
    prevFilterString = filterString;
    var visibleIndex = 0;
    for (var i = 0, l = ruleContainerList.length; i < l; i++) {
        var container = ruleContainerList[i];
        var matched = isMatched(container.rule, filterString);
        container.filtered = !matched;
        container.applyClassName(visibleIndex);
        if (matched)
            visibleIndex++;
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
    var visibleIndex = 0;
    for (var i = 0, l = ruleContainerList.length; i < l; i++) {
        ruleContainerList[i].deselect();
        ruleContainerList[i].applyClassName(visibleIndex);
        if (!ruleContainerList[i].filtered)
            visibleIndex++;
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
        if (this.filtered) {
            this.liElement.className = 'filtered';
        }
    };
    RuleContainer.prototype.getLiElement = function () {
        if (this.liElement)
            return this.liElement;
        this.liElement = document.createElement('LI');
        var buttonContainer = document.createElement('DIV');
        buttonContainer.className = 'buttonContainer';
        buttonContainer.appendChild(this.createSelectButton());
        this.disableBox = this.createDisableBox();
        buttonContainer.appendChild(this.disableBox);
        buttonContainer.appendChild(this.createDeleteButton());
        this.liElement.appendChild(buttonContainer);
        var informationDiv = document.createElement('DIV');
        informationDiv.className = 'information';
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
            span.className = 'blockAnyway';
            keywordsDiv.appendChild(span);
        }
        else {
            for (var i = 0, l = this.rule.words.length; i < l; i++) {
                var keywordSpan = document.createElement('SPAN');
                keywordSpan.className = (this.rule.words[i].is_regexp) ? "keyword regex" : "keyword normal";
                keywordSpan.innerHTML = this.rule.words[i].word;
                keywordsDiv.appendChild(keywordSpan);
            }
        }
        informationDiv.appendChild(titleDiv);
        informationDiv.appendChild(urlDiv);
        informationDiv.appendChild(keywordsDiv);
        var exampleLink = document.createElement('A');
        exampleLink.className = 'exampleUrl';
        exampleLink.innerHTML = '[LINK]';
        exampleLink.setAttribute("target", '_blank');
        exampleLink.setAttribute("href", this.rule.example_url);
        var favicon = document.createElement('IMG');
        var hrefValue = (this.rule.example_url) ? 'chrome://favicon/' + this.rule.example_url : chrome.extension.getURL('img/world.png');
        favicon.setAttribute("src", hrefValue);
        favicon.className = 'favicon';
        informationDiv.appendChild(favicon);
        informationDiv.appendChild(exampleLink);
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
        var rule = this.rule;
        return function (event) {
            rule.is_disabled = !rule.is_disabled;
            inputButton.value = (rule.is_disabled) ? 'OFF' : 'ON';
            inputButton.className = (rule.is_disabled) ? 'uiButton buttonOff' : 'uiButton buttonOn';
            cbStorage.saveRule(rule, function () { reloadBackground(); });
        };
    };
    RuleContainer.prototype.getSelectAction = function () {
        var self = this;
        return function () {
            document.getElementById('rule_editor_alert').style.display = 'none';
            ruleEditor.selectRule(self.rule);
            deselectAll();
            self.selected = true;
            self.applyClassName();
        };
    };
    RuleContainer.prototype.getDeleteAction = function () {
        var self = this;
        return function () {
            if (window.confirm(chrome.i18n.getMessage('dialogDelete'))) {
                cbStorage.deleteRule(self.rule, function () { });
                self.liElement.parentNode.removeChild(self.liElement);
                removeElement(self);
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
        this.addWordButton = document.getElementById('rule_editor_add_keyword_button');
        this.addWordButton.addEventListener('click', this.getAddWordAction(), true);
        document.getElementById('rule_editor_keyword').addEventListener('keydown', this.getAddWordByEnterAction(), true);
        this.alertDiv = document.getElementById('rule_editor_alert');
        document.getElementById('rule_editor_keyword_complete_matching_checkbox').addEventListener('click', PrefRuleEditor.changeKeywordColor, false);
        document.getElementById('rule_editor_block_anyway').addEventListener('change', PrefRuleEditor.setVisibilityOfConditionDetail, false);
        document.getElementById('rule_editor_block_anyway_false').addEventListener('change', PrefRuleEditor.setVisibilityOfConditionDetail, false);
        PrefRuleEditor.changeKeywordColor(null);
    }
    PrefRuleEditor.changeKeywordColor = function (sender) {
        document.getElementById('rule_editor_keyword').style.backgroundColor =
            (document.getElementById('rule_editor_keyword_complete_matching_checkbox').checked) ? '#fed3de!important' : '#cdedf8!important';
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
        console.log("Rule selected: " + rule.title);
        this.rule = rule;
        document.getElementById('rule_editor_keywords').innerHTML = '';
        if (rule) {
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
            refreshPathSections();
        }
        for (var i = 0, l = rule.words.length; i < l; i++) {
            var word = rule.words[i];
            document.getElementById('rule_editor_keywords').appendChild(this.getWordElement(word));
        }
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
        if (CustomBlockerUtil.isEmpty(this.rule.user_identifier)) {
            this.rule.user_identifier = UUID.generate();
        }
        if (CustomBlockerUtil.isEmpty(this.rule.global_identifier)) {
            this.rule.global_identifier = UUID.generate();
        }
        cbStorage.saveRule(this.rule, function () {
            hideEmptyAlert();
            self.showMessage(chrome.i18n.getMessage('saveDone'));
            reloadBackground();
        });
    };
    PrefRuleEditor.prototype.getWordElement = function (word) {
        var span = document.createElement('SPAN');
        var suffix = word.is_complete_matching ? 'red' : 'blue';
        if (word.is_regexp) {
            span.appendChild(CustomBlockerUtil.createKeywordOptionIcon("keyword_regexp", suffix, "regex"));
        }
        if (word.is_case_sensitive) {
            span.appendChild(CustomBlockerUtil.createKeywordOptionIcon("keyword_case_sensitive", suffix, "case_sensitive"));
        }
        if (word.is_include_href) {
            span.appendChild(CustomBlockerUtil.createKeywordOptionIcon("keyword_include_href", suffix, "include_href"));
        }
        span.innerHTML += CustomBlockerUtil.escapeHTML(word.word);
        span.className = 'word '
            + ((word.is_complete_matching) ? 'complete_matching' : 'not_complete_matching');
        var deleteButton = CustomBlockerUtil.createDeleteButton();
        deleteButton.addEventListener('click', this.getDeleteWordAction(word, span), true);
        span.appendChild(deleteButton);
        return span;
    };
    PrefRuleEditor.prototype.getDeleteWordAction = function (word, span) {
        var self = this;
        return function () {
            span.parentNode.removeChild(span);
            cbStorage.removeWordFromRule(self.rule, word);
            cbStorage.saveRule(self.rule, null);
        };
    };
    PrefRuleEditor.prototype.getAddWordByEnterAction = function () {
        var self = this;
        return function (event) {
            if (13 == event.keyCode) {
                self.saveWord();
            }
        };
    };
    PrefRuleEditor.prototype.getAddWordAction = function () {
        var self = this;
        return function () {
            self.saveWord();
        };
    };
    PrefRuleEditor.prototype.saveWord = function () {
        var self = this;
        var str = document.getElementById('rule_editor_keyword').value;
        if (!str || '' == str) {
            return;
        }
        var word = cbStorage.createWord();
        word.word = str;
        word.is_regexp =
            document.getElementById('rule_editor_keyword_regexp_checkbox').checked;
        word.is_complete_matching =
            document.getElementById('rule_editor_keyword_complete_matching_checkbox').checked;
        word.is_case_sensitive =
            document.getElementById('rule_editor_keyword_case_sensitive_checkbox').checked;
        word.is_include_href =
            document.getElementById('rule_editor_keyword_include_href_checkbox').checked;
        word.rule_id = self.rule.rule_id;
        cbStorage.addWordToRule(self.rule, word);
        cbStorage.saveRule(self.rule, function () {
            document.getElementById('rule_editor_keywords').appendChild(self.getWordElement(word));
            document.getElementById('rule_editor_keyword').value = '';
        });
    };
    return PrefRuleEditor;
}());
window.onload = onStart;
//# sourceMappingURL=list_rules.js.map