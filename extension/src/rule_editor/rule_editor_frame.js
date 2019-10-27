var pathInputFields = [
    { pickButton: "rule_editor_button_search_block_xpath", field: "rule_editor_search_block_xpath", type: "search_xpath" },
    { pickButton: "rule_editor_button_search_block_css", field: "rule_editor_search_block_css", type: "search_css" },
    { pickButton: "rule_editor_button_hide_block_xpath", field: "rule_editor_hide_block_xpath", type: "hide_xpath" },
    { pickButton: "rule_editor_button_hide_block_css", field: "rule_editor_hide_block_css", type: "hide_css" }
];
var RuleEditorFrame = (function () {
    function RuleEditorFrame() {
        var _this = this;
        this.url = null;
        this.rule = null;
        this.height = 0;
        this.group_picker = new WordGroupPicker(document.getElementById("rule_editor_keyword_group_select"));
        this.group_picker.onSelectGroup = function (group) {
            console.log("RuleEditor group selected.");
            _this.rule.wordGroups.push(group);
            _this.renderGroups(_this.rule.wordGroups);
            _this.group_picker.refresh();
            _this.resize();
        };
        var self = this;
        this.title = document.getElementById('rule_editor_title');
        this.site_regexp = document.getElementById('rule_editor_site_regexp');
        this.specify_url_by_regexp_checkbox = document.getElementById('specify_url_by_regexp_checkbox');
        this.example_url = document.getElementById('rule_editor_example_url');
        this.search_block_xpath = document.getElementById('rule_editor_search_block_xpath');
        this.search_block_css = document.getElementById('rule_editor_search_block_css');
        this.radio_search_css = document.getElementById('rule_editor_radio_search_css');
        this.radio_search_xpath = document.getElementById('rule_editor_radio_search_xpath');
        this.hide_block_xpath = document.getElementById('rule_editor_hide_block_xpath');
        this.hide_block_css = document.getElementById('rule_editor_hide_block_css');
        this.radio_hide_css = document.getElementById('rule_editor_radio_hide_css');
        this.radio_hide_xpath = document.getElementById('rule_editor_radio_hide_xpath');
        this.block_anyway = document.getElementById('rule_editor_block_anyway');
        this.block_anyway_false = document.getElementById('rule_editor_block_anyway_false');
        this.hide_detail = document.getElementById('rule_editor_hide_detail');
        var pathTextChangeHandler = this.getRefreshPathSecionsAction();
        this.radio_hide_xpath.addEventListener('change', pathTextChangeHandler, false);
        this.radio_hide_css.addEventListener('change', pathTextChangeHandler, false);
        this.radio_search_xpath.addEventListener('change', pathTextChangeHandler, false);
        this.radio_search_css.addEventListener('change', pathTextChangeHandler, false);
        var refreshHideBlockFunc = this.getRefreshHideBlockXPathAction();
        var refreshSearchBlockFunc = this.getRefreshSearchBlockXPathAction();
        this.hide_block_xpath.addEventListener('keyup', refreshHideBlockFunc, false);
        this.search_block_xpath.addEventListener('keyup', refreshSearchBlockFunc, false);
        this.hide_block_xpath.addEventListener('change', refreshHideBlockFunc, false);
        this.search_block_xpath.addEventListener('change', refreshSearchBlockFunc, false);
        this.hide_block_css.addEventListener('keyup', refreshHideBlockFunc, false);
        this.search_block_css.addEventListener('keyup', refreshSearchBlockFunc, false);
        this.hide_block_css.addEventListener('change', refreshHideBlockFunc, false);
        this.search_block_css.addEventListener('change', refreshSearchBlockFunc, false);
        var changeHandler = this.getChangedAction();
        this.title.addEventListener('change', changeHandler, false);
        this.site_regexp.addEventListener('change', changeHandler, false);
        this.example_url.addEventListener('change', changeHandler, false);
        this.search_block_xpath.addEventListener('change', changeHandler, false);
        this.search_block_css.addEventListener('change', changeHandler, false);
        this.radio_search_css.addEventListener('change', changeHandler, false);
        this.radio_search_xpath.addEventListener('change', changeHandler, false);
        this.hide_block_xpath.addEventListener('change', changeHandler, false);
        this.hide_block_css.addEventListener('change', changeHandler, false);
        this.radio_hide_css.addEventListener('change', changeHandler, false);
        this.radio_hide_xpath.addEventListener('change', changeHandler, false);
        this.block_anyway.addEventListener('change', changeHandler, false);
        this.block_anyway_false.addEventListener('change', changeHandler, false);
        this.specify_url_by_regexp_checkbox.addEventListener('change', changeHandler, false);
        for (var i = 0; i < pathInputFields.length; i++) {
            document.getElementById(pathInputFields[i].pickButton).addEventListener('click', this.getPickPathAction(pathInputFields[i].type), false);
        }
        document.getElementById('rule_editor_keyword_complete_matching_checkbox').addEventListener('click', function () { RuleEditorFrame.changeKeywordColor(); }, false);
        RuleEditorFrame.changeKeywordColor();
        var helpLinks = CustomBlockerUtil.getElementsByXPath('id("rule_editor_body")//a[@class="help"]');
        for (var i = 0, l = helpLinks.length; i < l; i++) {
            var link = helpLinks[i];
            link.addEventListener('click', CustomBlockerUtil.getShowHelpAction(link.href), false);
            link.href = 'javascript:void(0)';
        }
        document.getElementById('rule_editor_keyword').addEventListener('keydown', function (e) {
            if (KEY_CODE_RETURN == e.keyCode) {
                self.addWord();
            }
        }, true);
        document.getElementById('rule_editor_add_keyword_button').addEventListener('click', function () {
            self.addWord();
        }, true);
        document.getElementById('rule_editor_site_regexp')
            .addEventListener('keyup', this.displaySiteExpressionMatchResult(), false);
        document.getElementById('rule_editor_save_button').addEventListener('click', function () { self.saveRule(); }, true);
        document.getElementById('rule_editor_test_button').addEventListener('click', function () { self.testRule(); }, false);
        document.getElementById('rule_editor_close_button').addEventListener('click', function () { self.close(); }, false);
    }
    RuleEditorFrame.prototype.removeGroup = function (group) {
        for (var groupId = 0; groupId < this.rule.wordGroups.length; groupId++) {
            if (this.rule.wordGroups[groupId].global_identifier == group.global_identifier) {
                this.rule.wordGroups.splice(groupId, 1);
                this.renderGroups(this.rule.wordGroups);
                this.group_picker.refresh();
                return;
            }
        }
    };
    RuleEditorFrame.prototype.renderGroups = function (groups) {
        var _this = this;
        document.getElementById("rule_editor_keyword_groups").innerHTML = "";
        groups.forEach(function (group) {
            CustomBlockerUtil.createWordGroupElement(group, function () { _this.removeGroup(group); });
            document.getElementById("rule_editor_keyword_groups").appendChild(CustomBlockerUtil.createWordGroupElement(group, function () { _this.removeGroup(group); }));
        });
    };
    RuleEditorFrame.prototype.renderRule = function (data) {
        var rule = data.rule;
        this.url = data.url;
        this.rule = rule;
        this.group_picker.setRule(this.rule);
        this.group_picker.refresh();
        this.renderGroups(this.rule.wordGroups);
        document.getElementById('rule_editor_title').value = rule.title;
        document.getElementById('rule_editor_keywords').innerHTML = '';
        for (var _i = 0, _a = rule.words; _i < _a.length; _i++) {
            var word = _a[_i];
            document.getElementById('rule_editor_keywords').appendChild(CustomBlockerUtil.createWordElement(word, this.getWordDeleteAction(word)));
        }
        document.getElementById("rule_editor_alert_site_regexp").style.display = "none";
        document.getElementById("rule_editor_alert").style.display = "none";
        document.getElementById("rule_editor_alert_search_block_xpath").style.display = "none";
        document.getElementById("rule_editor_alert_hide_block_xpath").style.display = "none";
        this.title.value = rule.title;
        this.site_regexp.value = rule.site_regexp;
        this.example_url.value = rule.example_url;
        this.search_block_xpath.value = rule.search_block_xpath;
        this.search_block_css.value = rule.search_block_css;
        ((rule.search_block_by_css) ? this.radio_search_css : this.radio_search_xpath).checked = true;
        this.hide_block_xpath.value = rule.hide_block_xpath;
        this.hide_block_css.value = rule.hide_block_css;
        ((rule.hide_block_by_css) ? this.radio_hide_css : this.radio_hide_xpath).checked = true;
        ((rule.block_anyway) ? this.block_anyway : this.block_anyway_false).checked = true;
        this.specify_url_by_regexp_checkbox.checked = rule.specify_url_by_regexp;
        this.setBlockAnywayStyle(this.block_anyway.checked);
        document.getElementById('rule_editor_keyword').focus();
        this.refreshPathSections();
        this.refreshXPathSelectedStyles();
    };
    RuleEditorFrame.prototype.reloadBG = function () {
        try {
            var bgWindow = chrome.extension.getBackgroundPage();
            bgWindow.reloadLists();
        }
        catch (ex) {
            alert(ex);
        }
    };
    RuleEditorFrame.prototype.saveRule = function () {
        var _this = this;
        var dialog = this;
        var validateErrors = this.validateInput();
        if (validateErrors.length > 0) {
            this.showAlertMessage(validateErrors.join('<br/>'));
            return;
        }
        this.applyInput();
        console.log(this.rule);
        postMessageToParent({ command: "customblocker_save_rule", rule: this.rule });
        setTimeout(function () { _this.reloadBG(); }, 250);
    };
    RuleEditorFrame.prototype.close = function () {
        postMessageToParent({ command: "customblocker_close" });
    };
    RuleEditorFrame.prototype.showAlertMessage = function (message) {
        var div = document.getElementById('rule_editor_alert');
        div.style.display = 'block';
        div.innerHTML = message;
        this.resize();
    };
    RuleEditorFrame.prototype.validateInput = function () {
        return cbStorage.validateRule({
            title: this.title.value,
            site_regexp: this.site_regexp.value,
            example_url: this.example_url.value,
            search_block_xpath: this.search_block_xpath.value,
            search_block_css: this.search_block_css.value,
            hide_block_xpath: this.hide_block_xpath.value,
            hide_block_css: this.hide_block_css.value
        });
    };
    RuleEditorFrame.prototype.applyInput = function () {
        this.rule.title = this.title.value;
        this.rule.site_regexp = this.site_regexp.value;
        this.rule.example_url = this.example_url.value;
        this.rule.search_block_xpath = this.search_block_xpath.value;
        this.rule.search_block_css = this.search_block_css.value;
        this.rule.search_block_by_css = this.radio_search_css.checked;
        this.rule.hide_block_xpath = this.hide_block_xpath.value;
        this.rule.hide_block_css = this.hide_block_css.value;
        this.rule.hide_block_by_css = this.radio_hide_css.checked;
        this.rule.block_anyway = this.block_anyway.checked;
        this.rule.specify_url_by_regexp = this.specify_url_by_regexp_checkbox.checked;
    };
    RuleEditorFrame.prototype.testRule = function () {
        var validateErrors = this.validateInput();
        if (validateErrors.length > 0) {
            this.showAlertMessage(validateErrors.join('<br/>'));
            return;
        }
        this.applyInput();
        postMessageToParent({ command: "customblocker_test_rule", rule: this.rule });
    };
    RuleEditorFrame.prototype.displaySiteExpressionMatchResult = function () {
        var self = this;
        return function () {
            var regex;
            if (document.getElementById('specify_url_by_regexp_checkbox').checked) {
                regex = new RegExp(document.getElementById('rule_editor_site_regexp').value);
            }
            else {
                regex = new RegExp(CustomBlockerUtil.wildcardToRegExp(document.getElementById('rule_editor_site_regexp').value));
            }
            var matched = regex.test(self.url);
            document.getElementById('rule_editor_alert_site_regexp').style.display = (matched) ? 'none' : 'block';
            self.resize();
        };
    };
    RuleEditorFrame.prototype.onPathPick = function (data) {
        for (var _i = 0, pathInputFields_1 = pathInputFields; _i < pathInputFields_1.length; _i++) {
            var field = pathInputFields_1[_i];
            if (field.type == data.target) {
                document.getElementById(field.field).value = data.path;
                break;
            }
        }
        this.refreshXPathSelectedStyles();
    };
    RuleEditorFrame.prototype.addWord = function () {
        var wordStr = document.getElementById('rule_editor_keyword').value;
        console.log("addWord word=" + wordStr);
        if (!wordStr || '' == wordStr)
            return;
        var word = cbStorage.createWord();
        word.word = wordStr;
        word.isNew = true;
        word.is_regexp =
            document.getElementById('rule_editor_keyword_regexp_checkbox').checked;
        word.is_complete_matching =
            document.getElementById('rule_editor_keyword_complete_matching_checkbox').checked;
        word.is_case_sensitive =
            document.getElementById('rule_editor_keyword_case_sensitive_checkbox').checked;
        word.is_include_href =
            document.getElementById('rule_editor_keyword_include_href_checkbox').checked;
        if (word.is_regexp) {
            try {
                new RegExp(wordStr);
            }
            catch (ex) {
                alert(chrome.i18n.getMessage('invalidRegEx'));
                return;
            }
        }
        word.dirty = true;
        var span = this.getWordElement(word);
        document.getElementById('rule_editor_keywords').appendChild(span);
        this.resize();
        this.rule.words.push(word);
        if (this.rule.rule_id > 0) {
            word.rule_id = this.rule.rule_id;
        }
        else {
            word.rule_id = 0;
        }
        document.getElementById('rule_editor_keyword').value = '';
        return;
    };
    RuleEditorFrame.prototype.getWordElement = function (word) {
        return CustomBlockerUtil.createWordElement(word, this.getWordDeleteAction(word));
    };
    RuleEditorFrame.changeKeywordColor = function () {
        document.getElementById('rule_editor_keyword').style.backgroundColor =
            (document.getElementById('rule_editor_keyword_complete_matching_checkbox').checked) ? '#fed3de' : '#cdedf8';
    };
    RuleEditorFrame.prototype.setBlockAnywayStyle = function (on) {
        this.hide_detail.style.display = (on) ? 'none' : 'block';
        this.resize();
    };
    RuleEditorFrame.prototype.getWordDeleteAction = function (word) {
        var self = this;
        return function (span) {
            span.parentNode.removeChild(span);
            for (var wordId = 0; wordId < self.rule.words.length; wordId++) {
                if (self.rule.words[wordId] == word) {
                    self.rule.words.splice(wordId, 1);
                    self.resize();
                    return;
                }
            }
        };
    };
    RuleEditorFrame.prototype.getChangedAction = function () {
        var self = this;
        return function (event) {
            self.setBlockAnywayStyle(self.block_anyway.checked);
            self.displaySiteExpressionMatchResult();
        };
    };
    RuleEditorFrame.prototype.getRefreshHideBlockXPathAction = function () {
        var self = this;
        return function (event) {
            self.refreshXPathSelectedStyles();
        };
    };
    RuleEditorFrame.prototype.getRefreshSearchBlockXPathAction = function () {
        var self = this;
        return function (event) {
            self.refreshXPathSelectedStyles();
        };
    };
    RuleEditorFrame.prototype.getPickPathAction = function (target) {
        return function (event) {
            postMessageToParent({ command: "customblocker_pick_path", target: target });
        };
    };
    RuleEditorFrame.prototype.getRefreshPathSecionsAction = function () {
        var self = this;
        return function (event) {
            self.refreshPathSections();
            self.refreshXPathSelectedStyles();
        };
    };
    RuleEditorFrame.prototype.refreshPathSections = function () {
        var hideByXPath = document.getElementById('rule_editor_radio_hide_xpath').checked;
        var searchByXPath = document.getElementById('rule_editor_radio_search_xpath').checked;
        document.getElementById('rule_editor_section_hide_xpath').style.display = (hideByXPath) ? 'block' : 'none';
        document.getElementById('rule_editor_section_hide_css').style.display = (hideByXPath) ? 'none' : 'block';
        document.getElementById('rule_editor_section_search_xpath').style.display = (searchByXPath) ? 'block' : 'none';
        document.getElementById('rule_editor_section_search_css').style.display = (searchByXPath) ? 'none' : 'block';
    };
    RuleEditorFrame.prototype.refreshXPathSelectedStyles = function () {
        var options = {
            command: "customblocker_validate_selectors",
            hide_type: null,
            hide_selector: null,
            search_type: null,
            search_selector: null
        };
        if (document.getElementById('rule_editor_radio_hide_xpath').checked) {
            options.hide_type = "xpath";
            options.hide_selector = document.getElementById('rule_editor_hide_block_xpath').value;
        }
        else {
            options.hide_type = "css";
            options.hide_selector = document.getElementById('rule_editor_hide_block_css').value;
        }
        if (document.getElementById('rule_editor_radio_search_xpath').checked) {
            options.search_type = "xpath";
            options.search_selector = document.getElementById('rule_editor_search_block_xpath').value;
        }
        else {
            options.search_type = "css";
            options.search_selector = document.getElementById('rule_editor_search_block_css').value;
        }
        this.resize();
        postMessageToParent(options);
    };
    RuleEditorFrame.prototype.showSelectorValidationResult = function (data) {
        var searchCountLabel = data.searchType == "xpath" ?
            document.getElementById('rule_editor_count_search_block_xpath') : document.getElementById('rule_editor_count_search_block_css');
        if (data.hideValid) {
            document.getElementById('rule_editor_alert_search_block_xpath').style.display = "none";
            searchCountLabel.innerHTML = data.searchCount;
        }
        else {
            searchCountLabel.innerHTML = "-";
            document.getElementById('rule_editor_alert_search_block_xpath').style.display = "block";
            document.getElementById('rule_editor_alert_search_block_xpath').innerHTML =
                "Invalid " + (data.searchType == "xpath" ? "XPath" : "CSS selector");
        }
        var hideCountLabel = data.hideType == "xpath" ?
            document.getElementById('rule_editor_count_hide_block_xpath') : document.getElementById('rule_editor_count_hide_block_css');
        if (data.hideValid) {
            document.getElementById('rule_editor_alert_hide_block_xpath').style.display = "none";
            hideCountLabel.innerHTML = data.hideCount;
        }
        else {
            hideCountLabel.innerHTML = "-";
            document.getElementById('rule_editor_alert_hide_block_xpath').style.display = "block";
            document.getElementById('rule_editor_alert_hide_block_xpath').innerHTML =
                "Invalid " + (data.hideType == "xpath" ? "XPath" : "CSS selector");
        }
        this.resize();
    };
    RuleEditorFrame.prototype.resize = function () {
        var currentHeight = document.getElementById("rule_editor_outline").clientHeight;
        if (this.height != currentHeight) {
            this.height = currentHeight;
            postMessageToParent({ command: "customblocker_resize", height: currentHeight + 4 });
        }
    };
    return RuleEditorFrame;
}());
function handleReceivedMessage(event) {
    switch (event.data.command) {
        case "customblocker_set_rule": {
            if (event.data.rule) {
                editor.renderRule(event.data);
            }
            break;
        }
        case "customblocker_validate_selectors_result": {
            editor.showSelectorValidationResult(event.data);
            break;
        }
        case "customblocker_path_picked": {
            editor.onPathPick(event.data);
            break;
        }
        case "customblocker_rule_saved": {
            editor.showAlertMessage(chrome.i18n.getMessage('saveDone'));
            break;
        }
    }
}
function postMessageToParent(message) {
    window.parent.postMessage(message, "*");
}
function initRuleEditor() {
    var scope = this;
    cbStorage.loadAll(function (rules, groups) {
        editor.group_picker.setGroups(groups);
        editor.group_picker.refresh();
    });
    postMessageToParent({ command: "customblocker_frame_ready" });
}
var editor;
window.onload = function () {
    editor = new RuleEditorFrame();
    window.addEventListener("message", handleReceivedMessage, false);
    initRuleEditor();
};
//# sourceMappingURL=rule_editor_frame.js.map