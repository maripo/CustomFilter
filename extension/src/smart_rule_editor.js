var SmartRuleCreator = (function () {
    function SmartRuleCreator(targetElement, appliedRuleList, selectionText, needSuggestion) {
        CustomBlockerUtil.applyCss('/css/reset.css');
        CustomBlockerUtil.applyCss('/css/smart_rule_editor.css');
        CustomBlockerUtil.applyCss('/css/rule_editor_common.css');
        CustomBlockerUtil.applyCss('/css/keywords.css');
        this.appliedRuleList = appliedRuleList;
        this.targetElement = targetElement;
        this.selectionText = selectionText;
        this.needSuggestion = needSuggestion;
        this.showLoadingIcon();
        window.setTimeout(this.getScanThread(), 1000);
        CustomBlockerUtil.enableFlashZIndex();
    }
    SmartRuleCreator.prototype.getScanThread = function () {
        var self = this;
        return function () {
            self.scanExistingRules();
            if (self.needSuggestion || self.matchedRules.length == 0)
                self.createNewRules();
            self.hideLoadingIcon();
            window.smartRuleCreatorDialog.show(self, lastRightClickedElement, lastRightClickEvent);
        };
    };
    SmartRuleCreator.prototype.createNewRules = function () {
        if (!this.matchedRules)
            this.matchedRules = new Array();
        for (var i = 0; i < this.matchedRules.length; i++) {
            var rule = this.matchedRules[i];
            var hideNodes = (rule.hide_block_by_css) ?
                CustomBlockerUtil.getElementsByCssSelector(rule.hide_block_css)
                :
                    CustomBlockerUtil.getElementsByXPath(rule.hide_block_xpath);
            var searchNodes = (rule.search_block_by_css) ?
                CustomBlockerUtil.getElementsByCssSelector(rule.search_block_css || rule.hide_block_css)
                :
                    CustomBlockerUtil.getElementsByXPath(rule.search_block_xpath || rule.hide_block_xpath);
            rule.hideNodes = hideNodes;
            rule.searchNodes = searchNodes;
        }
        var analyzer = new SmartPathAnalyzer(this.targetElement, new CssBuilder(), this.appliedRuleList);
        this.hideLoadingIcon();
        this.suggestedPathList = analyzer.createPathList();
    };
    SmartRuleCreator.prototype.showLoadingIcon = function () {
        this.loadingImageDiv = document.createElement('DIV');
        this.loadingImageDiv.style.zIndex = String(RuleEditor.getMaxZIndex() + 1);
        this.loadingImageDiv.style.padding = '8px';
        this.loadingImageDiv.style.borderRadius = '4px';
        this.loadingImageDiv.style.border = '1px solid #888';
        this.loadingImageDiv.style.position = "absolute";
        this.loadingImageDiv.style.left = lastRightClickEvent.clientX + document.body.scrollLeft + "px";
        this.loadingImageDiv.style.top = lastRightClickEvent.clientY + document.body.scrollTop + "px";
        this.loadingImageDiv.style.backgroundColor = "white";
        var loadingImage = document.createElement('IMG');
        loadingImage.setAttribute("src", chrome.extension.getURL('/img/loading.gif'));
        this.loadingImageDiv.appendChild(loadingImage);
        document.body.appendChild(this.loadingImageDiv);
    };
    SmartRuleCreator.prototype.hideLoadingIcon = function () {
        if (this.loadingImageDiv && this.loadingImageDiv.parentNode) {
            this.loadingImageDiv.parentNode.removeChild(this.loadingImageDiv);
        }
    };
    SmartRuleCreator.prototype.scanExistingRules = function () {
        this.matchedRules = new Array();
        if (!this.appliedRuleList)
            return;
        for (var i = 0; i < this.appliedRuleList.length; i++) {
            var rule = this.appliedRuleList[i];
            if (this.isMatched(rule))
                this.matchedRules.push(rule);
        }
    };
    SmartRuleCreator.prototype.isMatched = function (rule) {
        var searchNodes;
        if (rule.block_anyway) {
            searchNodes = (rule.hide_block_by_css) ?
                CustomBlockerUtil.getElementsByCssSelector(rule.hide_block_css)
                :
                    CustomBlockerUtil.getElementsByXPath(rule.hide_block_xpath);
        }
        else {
            searchNodes = (rule.search_block_by_css) ?
                CustomBlockerUtil.getElementsByCssSelector(rule.search_block_css)
                :
                    CustomBlockerUtil.getElementsByXPath(rule.search_block_xpath);
        }
        for (var i = 0; i < searchNodes.length; i++) {
            if (CustomBlockerUtil.isContained(this.targetElement, searchNodes[i]))
                return true;
        }
        return false;
    };
    return SmartRuleCreator;
}());
var SmartRuleCreatorDialog = (function () {
    function SmartRuleCreatorDialog(_zIndex, smartRuleEditorSrc) {
        this.smartRuleEditorSrc = smartRuleEditorSrc;
        this.div = document.createElement('DIV');
        this.div.id = 'smart_rule_creator_dialog';
        this.div.setAttribute("avoidStyle", "true");
        this.div.style.zIndex = String(_zIndex);
        this.div.style.display = "none";
        this.ul = document.createElement('UL');
        this.ul.className = 'active';
        this.div.appendChild(this.ul);
        document.body.appendChild(this.div);
        {
            var editDiv = document.createElement('DIV');
            this.editDiv = editDiv;
            editDiv.id = 'smart_rule_creator_dialog_edit';
            editDiv.style.display = 'none';
            editDiv.innerHTML = this.smartRuleEditorSrc;
            this.div.appendChild(editDiv);
        }
        var helpLink = document.getElementById('smartRuleEditorPreviewHelp');
        helpLink.addEventListener('click', CustomBlockerUtil.getShowHelpAction(helpLink.getAttribute("href")), false);
        helpLink.setAttribute("href", 'javascript:void(0)');
        document.getElementById('smart_rule_editor_body').style.display = 'none';
        document.getElementById('smart_rule_editor_path_img').setAttribute("src", chrome.extension.getURL('/img/smart_path_preview_img.png'));
        this.advancedSectionVisible = false;
        document.getElementById('smart_rule_editor_save').addEventListener('click', this.getSaveAction(), true);
        document.getElementById('smart_rule_editor_cancel').addEventListener('click', this.getCancelAction(), true);
        document.getElementById('smart_rule_editor_close').addEventListener('click', this.getCloseAction(), true);
        document.getElementById('smart_rule_editor_keyword_add').addEventListener('click', this.getAddKeywordAction(), true);
        document.getElementById('smart_rule_editor_advanced_link').addEventListener('click', this.getToggleAdvancedAction(), true);
        this.radio_search_css = document.getElementById('smart_rule_editor_radio_search_css');
        this.radio_search_xpath = document.getElementById('smart_rule_editor_radio_search_xpath');
        this.radio_hide_css = document.getElementById('smart_rule_editor_radio_hide_css');
        this.radio_hide_xpath = document.getElementById('smart_rule_editor_radio_hide_xpath');
        this.input_keyword = document.getElementById('smart_rule_editor_keyword');
        this.input_title = document.getElementById('smart_rule_editor_title');
        this.input_url = document.getElementById('smart_rule_editor_url');
        this.input_example_url = document.getElementById('smart_rule_editor_example_url');
        this.input_site_description = document.getElementById('smart_rule_editor_site_description');
        this.input_search_block_xpath = document.getElementById('smart_rule_editor_search_block_xpath');
        this.input_search_block_css = document.getElementById('smart_rule_editor_search_block_css');
        this.input_hide_block_xpath = document.getElementById('smart_rule_editor_hide_block_xpath');
        this.input_hide_block_css = document.getElementById('smart_rule_editor_hide_block_css');
        this.radio_search_css.addEventListener('change', this.setPathInputVisibility, true);
        this.radio_search_xpath.addEventListener('change', this.setPathInputVisibility, true);
        this.radio_hide_css.addEventListener('change', this.setPathInputVisibility, true);
        this.radio_hide_xpath.addEventListener('change', this.setPathInputVisibility, true);
        this.input_keyword.addEventListener('keydown', this.getAddWordAction(), true);
        document.body.addEventListener('mouseup', this.getOnMouseupAction(), false);
        document.body.addEventListener('mousemove', this.getOnMousemoveAction(), false);
    }
    SmartRuleCreatorDialog.prototype.getOnMouseupAction = function () {
        var self = this;
        return function (event) {
            self.moving = false;
        };
    };
    SmartRuleCreatorDialog.prototype.getOnMousemoveAction = function () {
        var self = this;
        return function (event) {
            if (!self.moving)
                return;
            self.div.style.left = (self.origDivX + (event.pageX - self.origEventX)) + 'px';
            self.div.style.top = (self.origDivY + (event.pageY - self.origEventY)) + 'px';
            self.adjustEditDivPosition(event);
        };
    };
    SmartRuleCreatorDialog.prototype.getOnMousedownAction = function () {
        var self = this;
        return function (event) {
            self.moving = true;
            self.origEventX = event.pageX;
            self.origEventY = event.pageY;
            self.origDivX = parseInt(self.div.style.left.replace('px', ''));
            self.origDivY = parseInt(self.div.style.top.replace('px', ''));
        };
    };
    SmartRuleCreatorDialog.prototype.getCloseAction = function () {
        var self = this;
        return function (event) {
            window.elementHighlighter.highlightRule(null);
            self.div.style.display = 'none';
            self.cancelEditing();
        };
    };
    SmartRuleCreatorDialog.prototype.getCancelAction = function () {
        var self = this;
        return function (event) {
            self.cancelEditing();
        };
    };
    SmartRuleCreatorDialog.prototype.cancelEditing = function () {
        this.isEditing = false;
        this.isRuleSelected = false;
        this.isEditing = false;
        this.activeLiElement.className = 'option';
        this.ul.className = 'active';
        this.activeLiElement = null;
        document.getElementById('smart_rule_editor_preview').style.display = 'block';
        document.getElementById('smart_rule_editor_body').style.display = 'none';
    };
    SmartRuleCreatorDialog.prototype.getAddWordAction = function () {
        var self = this;
        return function (event) {
            if (KEY_CODE_RETURN == event.keyCode) {
                self.addWord(self.input_keyword.value);
                self.input_keyword.value = '';
            }
        };
    };
    SmartRuleCreatorDialog.prototype.getToggleAdvancedAction = function () {
        var self = this;
        return function (event) {
            self.advancedSectionVisible = !self.advancedSectionVisible;
            document.getElementById('smart_rule_editor_advanced').style.display = (self.advancedSectionVisible) ? 'block' : 'none';
            document.getElementById('smart_rule_editor_advanced_link').innerHTML =
                chrome.i18n.getMessage((self.advancedSectionVisible) ? 'smartRuleEditorHideAdvancedMode' : 'smartRuleEditorShowAdvancedMode');
        };
    };
    SmartRuleCreatorDialog.prototype.getAddKeywordAction = function () {
        var self = this;
        return function (event) {
            self.addWord(self.input_keyword.value);
            self.input_keyword.value = '';
            self.input_keyword.focus();
        };
    };
    SmartRuleCreatorDialog.prototype.getSaveAction = function () {
        var self = this;
        return function (event) {
            self.saveRule();
        };
    };
    SmartRuleCreatorDialog.prototype.saveRule = function () {
        var validateErrors = this.validate();
        if (validateErrors.length > 0) {
            this.showMessage(validateErrors.join('<br/>'));
            return;
        }
        this.applyInput();
        var _hideNodes = this.rule.hideNodes;
        var _searchNodes = this.rule.searchNodes;
        this.rule.hideNodes = null;
        this.rule.searchNodes = null;
        cbStorage.saveRule(this.rule, function () {
            window.bgCommunicator.sendRequest('notifyUpdate', null);
            this.rule.hideNodes = _hideNodes;
            this.rule.searchNodes = _searchNodes;
        });
    };
    SmartRuleCreatorDialog.prototype.validate = function () {
        return cbStorage.validateRule({
            title: this.input_title.value,
            site_regexp: this.input_url.value,
            example_url: this.input_example_url.value,
            search_block_xpath: this.input_search_block_xpath.value,
            search_block_css: this.input_search_block_css.value,
            hide_block_xpath: this.input_hide_block_xpath.value,
            hide_block_css: this.input_hide_block_css.value
        });
    };
    SmartRuleCreatorDialog.prototype.applyInput = function () {
        this.rule.title = this.input_title.value;
        this.rule.site_regexp = this.input_url.value;
        this.rule.example_url = this.input_example_url.value;
        this.rule.search_block_xpath = this.input_search_block_xpath.value;
        this.rule.search_block_css = this.input_search_block_css.value;
        this.rule.hide_block_xpath = this.input_hide_block_xpath.value;
        this.rule.hide_block_css = this.input_hide_block_css.value;
    };
    SmartRuleCreatorDialog.prototype.onSaveDone = function (rule) {
        this.rule.rule_id = rule.rule_id;
        for (var i = 0, l = this.rule.words.length; i < l; i++) {
            this.rule.words[i].word_id = rule.words[i].word_id;
        }
        this.showMessage(chrome.i18n.getMessage('saveDone'));
    };
    SmartRuleCreatorDialog.prototype.show = function (creator, target, event) {
        CustomBlockerUtil.clearChildren(this.ul);
        this.div.style.display = 'block';
        if (null != creator.matchedRules && creator.matchedRules.length > 0) {
            {
                var li = document.createElement('LI');
                li.innerHTML = chrome.i18n.getMessage('ruleEditorExistingRules');
                li.className = 'smartEditorSectionTitle';
                this.ul.appendChild(li);
                li.addEventListener('mousedown', this.getOnMousedownAction(), true);
            }
            for (var i = 0; i < creator.matchedRules.length; i++) {
                var rule = creator.matchedRules[i];
                if (!rule.hideNodes)
                    rule.hideNodes = new Array();
                if (!rule.searchNodes)
                    rule.searchNodes = new Array();
                var li = this.createLiElement(CustomBlockerUtil.shorten(rule.title, 19), rule.hideNodes.length, rule.searchNodes.length, chrome.i18n.getMessage('smartRuleEditorExistingButtonLabel'));
                li.addEventListener('mouseover', this.getExistingRuleHoverAction(rule, li), true);
                li.addEventListener('click', this.getExistingRuleClickAction(rule, li), true);
                this.ul.appendChild(li);
            }
        }
        if (creator.suggestedPathList && creator.suggestedPathList.length > 0) {
            var sectionLi = document.createElement('LI');
            sectionLi.innerHTML = chrome.i18n.getMessage('ruleEditorNewRules');
            sectionLi.className = 'smartEditorSectionTitle';
            sectionLi.addEventListener('mousedown', this.getOnMousedownAction(), true);
            this.ul.appendChild(sectionLi);
            for (var i = 0; i < creator.suggestedPathList.length; i++) {
                var path = creator.suggestedPathList[i];
                path.title = chrome.i18n.getMessage('smartRuleEditorSuggestedTitlePrefix') + (i + 1);
                var li_1 = this.createLiElement(path.title, path.hidePath.elements.length, path.searchPath.elements.length, chrome.i18n.getMessage('smartRuleEditorSuggestedButtonLabel'));
                li_1.addEventListener('mouseover', this.getSuggestedPathHoverAction(path, li_1), true);
                li_1.addEventListener('click', this.getSuggestedPathClickAction(path, li_1), true);
                li_1.className = 'option';
                this.ul.appendChild(li_1);
            }
        }
        this.input_keyword.value = creator.selectionText || '';
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        var _left = Math.min(event.clientX + document.body.scrollLeft, document.body.clientWidth - 190);
        var _top = event.clientY + scrollTop;
        this.div.style.left = _left + 'px';
        this.div.style.top = _top + 'px';
        var divElements = this.div.getElementsByTagName('*');
        this.div.setAttribute("avoidStyle", "true");
        for (var i = 0; i < divElements.length; i++) {
            divElements[i].setAttribute("avoidStyle", "true");
        }
    };
    SmartRuleCreatorDialog.prototype.createLiElement = function (title, hideCount, searchCount, buttonTitle) {
        var li = document.createElement('LI');
        var spanHideCount = document.createElement('SPAN');
        spanHideCount.className = 'hideCount';
        spanHideCount.innerHTML = String(hideCount);
        var spanSearchCount = document.createElement('SPAN');
        spanSearchCount.className = 'searchCount';
        spanSearchCount.innerHTML = String(searchCount);
        var spanTitle = document.createElement('SPAN');
        spanTitle.innerHTML = title;
        var button = document.createElement('INPUT');
        button.type = 'button';
        button.className = "uiButton";
        button.value = buttonTitle;
        li.appendChild(spanHideCount);
        li.appendChild(spanSearchCount);
        li.appendChild(spanTitle);
        li.appendChild(button);
        li.className = 'option';
        return li;
    };
    SmartRuleCreatorDialog.prototype.showEdit = function (event, liElement) {
        this.editDiv.style.top = (liElement.offsetTop - 20) + 'px';
        this.editDiv.style.display = 'block';
        this.adjustEditDivPosition(event);
    };
    SmartRuleCreatorDialog.prototype.adjustEditDivPosition = function (event) {
        var centerX = this.div.clientLeft + 90;
        var shouldShowDialogRight = event.clientX < document.body.clientWidth / 2;
        this.editDiv.style.left =
            ((shouldShowDialogRight) ? this.div.clientWidth : -this.editDiv.clientWidth - 4)
                + 'px';
    };
    SmartRuleCreatorDialog.prototype.getExistingRuleHoverAction = function (rule, liElement) {
        var self = this;
        return function (event) {
            if (self.isRuleSelected)
                return;
            self.showEdit(event, liElement);
            self.previewExistingRule(rule);
        };
    };
    SmartRuleCreatorDialog.prototype.previewExistingRule = function (rule) {
        window.elementHighlighter.highlightRule(rule);
        document.getElementById('smart_rule_editor_preview_title').innerHTML = rule.title;
        document.getElementById('smart_rule_editor_preview_hide_count').innerHTML = String(rule.hideNodes.length);
        document.getElementById('smart_rule_editor_preview_hide_path').innerHTML =
            CustomBlockerUtil.shorten(((rule.hide_block_by_css) ?
                rule.hide_block_css : rule.hide_block_xpath), SmartRuleCreatorDialog.PREVIEW_PATH_WIDTH);
        document.getElementById('smart_rule_editor_preview_search_count').innerHTML = String(rule.searchNodes.length);
        document.getElementById('smart_rule_editor_preview_search_path').innerHTML =
            CustomBlockerUtil.shorten(((rule.search_block_by_css) ?
                rule.search_block_css : rule.search_block_xpath), SmartRuleCreatorDialog.PREVIEW_PATH_WIDTH);
        CustomBlockerUtil.clearChildren(document.getElementById('smart_rule_editor_preview_keywords'));
        document.getElementById('smart_rule_editor_preview_suggested').style.display = 'none';
        for (var i = 0; i < rule.words.length; i++) {
            var keywordsDiv = document.getElementById('smart_rule_editor_preview_keywords');
            keywordsDiv.appendChild(CustomBlockerUtil.createSimpleWordElement(rule.words[i]));
            keywordsDiv.appendChild(document.createTextNode(' '));
        }
    };
    SmartRuleCreatorDialog.prototype.getExistingRuleClickAction = function (rule, li) {
        var self = this;
        return function (event) {
            if (self.isEditing)
                return;
            self.isEditing = true;
            self.activeLiElement = li;
            li.className = 'option selected';
            self.rule = rule;
            self.showEdit(event, li);
            self.showRule(rule);
        };
    };
    SmartRuleCreatorDialog.prototype.getSuggestedPathHoverAction = function (path, liElement) {
        var self = this;
        return function (event) {
            if (self.isRuleSelected)
                return;
            window.elementHighlighter.highlightHideElements(path.hidePath.elements);
            window.elementHighlighter.highlightSearchElements(path.searchPath.elements);
            self.showEdit(event, liElement);
            self.previewSuggestedPath(path);
        };
    };
    SmartRuleCreatorDialog.prototype.previewSuggestedPath = function (path) {
        document.getElementById('smart_rule_editor_preview_title').innerHTML = path.title;
        document.getElementById('smart_rule_editor_preview_suggested').style.display = 'block';
        document.getElementById('smart_rule_editor_preview_hide_count').innerHTML = String(path.hidePath.elements.length);
        document.getElementById('smart_rule_editor_preview_hide_path').innerHTML =
            CustomBlockerUtil.shorten(path.hidePath.path, SmartRuleCreatorDialog.PREVIEW_PATH_WIDTH);
        document.getElementById('smart_rule_editor_preview_search_count').innerHTML = String(path.searchPath.elements.length);
        document.getElementById('smart_rule_editor_preview_search_path').innerHTML =
            CustomBlockerUtil.shorten(path.searchPath.path, SmartRuleCreatorDialog.PREVIEW_PATH_WIDTH);
        CustomBlockerUtil.clearChildren(document.getElementById('smart_rule_editor_preview_keywords'));
    };
    SmartRuleCreatorDialog.prototype.getSuggestedPathClickAction = function (path, li) {
        var self = this;
        return function (event) {
            if (self.isEditing)
                return;
            self.isEditing = true;
            self.activeLiElement = li;
            li.className = 'option selected';
            self.rule = self.createRuleByPath(path);
            self.showEdit(event, li);
            self.showRule(self.rule);
        };
    };
    SmartRuleCreatorDialog.prototype.createRuleByPath = function (path) {
        var rule = cbStorage.createRule();
        rule.title = document.title;
        rule.site_regexp = location.href;
        rule.example_url = location.href;
        rule.search_block_by_css = true;
        rule.hide_block_by_css = true;
        rule.title = path.title;
        rule.search_block_css = path.searchPath.path;
        rule.search_block_xpath = null;
        rule.hide_block_css = path.hidePath.path;
        rule.hide_block_xpath = null;
        return rule;
    };
    SmartRuleCreatorDialog.prototype.showRule = function (rule) {
        this.ul.className = '';
        this.isRuleSelected = true;
        document.getElementById('smart_rule_editor_preview').style.display = 'none';
        document.getElementById('smart_rule_editor_body').style.display = 'block';
        this.input_example_url.value = rule.example_url;
        this.input_title.value = rule.title;
        this.input_url.value = rule.site_regexp;
        this.input_search_block_xpath.value = rule.search_block_xpath;
        this.input_search_block_css.value = rule.search_block_css;
        this.input_hide_block_xpath.value = rule.hide_block_xpath;
        this.input_hide_block_css.value = rule.hide_block_css;
        CustomBlockerUtil.clearChildren(this.input_keyword);
        var searchRadio = (rule.search_block_by_css) ? this.radio_search_css : this.radio_search_xpath;
        searchRadio.checked = true;
        var hideRadio = (rule.hide_block_by_css) ? this.radio_hide_css : this.radio_hide_xpath;
        hideRadio.checked = true;
        this.setPathInputVisibility();
        for (var i = 0; i < rule.words.length; i++) {
            document.getElementById('smart_rule_editor_keywords').appendChild(this.getWordElement(rule.words[i]));
        }
        this.input_keyword.focus();
    };
    SmartRuleCreatorDialog.prototype.setPathInputVisibility = function () {
        this.input_search_block_css.style.display = (this.radio_search_css.checked) ? 'inline' : 'none';
        this.input_search_block_xpath.style.display = (this.radio_search_xpath.checked) ? 'inline' : 'none';
        document.getElementById('smart_rule_editor_search_block_css_label').style.display
            = (this.radio_search_css.checked) ? 'inline' : 'none';
        document.getElementById('smart_rule_editor_search_block_xpath_label').style.display
            = (this.radio_search_xpath.checked) ? 'inline' : 'none';
        this.input_hide_block_css.style.display = (this.radio_hide_css.checked) ? 'inline' : 'none';
        this.input_hide_block_xpath.style.display = (this.radio_hide_xpath.checked) ? 'inline' : 'none';
        document.getElementById('smart_rule_editor_hide_block_css_label').style.display
            = (this.radio_hide_css.checked) ? 'inline' : 'none';
        document.getElementById('smart_rule_editor_hide_block_xpath_label').style.display
            = (this.radio_hide_xpath.checked) ? 'inline' : 'none';
    };
    SmartRuleCreatorDialog.prototype.getWordElement = function (word) {
        return CustomBlockerUtil.createWordElement(word, this.getWordDeleteAction(word));
    };
    SmartRuleCreatorDialog.prototype.getWordDeleteAction = function (word) {
        var self = this;
        return function (span) {
            span.parentNode.removeChild(span);
            word.deleted = true;
            word.dirty = true;
        };
    };
    SmartRuleCreatorDialog.prototype.addWord = function (wordStr) {
        if (!wordStr || '' == wordStr)
            return;
        var word = cbStorage.createWord();
        word.word = wordStr;
        word.isNew = true;
        word.is_regexp = document.getElementById('smart_rule_editor_keyword_regexp').checked;
        word.is_complete_matching = document.getElementById('smart_rule_editor_keyword_complete_matching').checked;
        word.dirty = true;
        var span = this.getWordElement(word);
        document.getElementById('smart_rule_editor_keywords').appendChild(span);
        this.rule.words.push(word);
        if (this.rule.rule_id > 0) {
            word.rule_id = this.rule.rule_id;
        }
        else {
            word.rule_id = 0;
        }
    };
    SmartRuleCreatorDialog.prototype.showMessage = function (message) {
        var div = document.getElementById('smart_rule_editor_alert');
        div.style.display = 'block';
        div.innerHTML = message;
    };
    SmartRuleCreatorDialog.initialize = function () {
        SmartRuleCreatorDialog.PREVIEW_PATH_WIDTH = 28;
    };
    return SmartRuleCreatorDialog;
}());
//# sourceMappingURL=smart_rule_editor.js.map