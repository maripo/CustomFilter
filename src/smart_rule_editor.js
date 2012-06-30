/**
 * SmartRuleCreator
 */
var SmartRuleCreator = function (targetElement, appliedRuleList, selectionText)
{
	CustomBlockerUtil.applyCss('/css/smart_rule_editor.css');
	CustomBlockerUtil.applyCss('/css/rule_editor_common.css');
	CustomBlockerUtil.applyCss('/css/keywords.css');
	this.appliedRuleList = appliedRuleList;
	this.targetElement = targetElement;
	this.selectionText = selectionText;
	this.scanExistingRules();
	this.createNewRules();
	CustomBlockerUtil.enableFlashZIndex();
};

SmartRuleCreator.prototype.createNewRules = function ()
{
	if (!this.matchedRules)
		this.matchedRules = new Array();
	for (var i=0; i<this.matchedRules.length; i++)
	{
		var rule = this.matchedRules[i];
		var hideNodes = (rule.hide_block_by_css)?
				CustomBlockerUtil.getElementsByCssSelector(rule.hide_block_css)
				:
				CustomBlockerUtil.getElementsByXPath(rule.hide_block_xpath);
		var searchNodes = 
			(rule.search_block_by_css)?
				CustomBlockerUtil.getElementsByCssSelector(rule.search_block_css)
				:
				CustomBlockerUtil.getElementsByXPath(rule.search_block_xpath);
		rule.hideNodes = hideNodes;
		rule.searchNodes = searchNodes;
	}
	var analyzer = new SmartPathAnalyzer(this.targetElement, new CssBuilder(), this.appliedRuleList);
	this.suggestedPathList = analyzer.createPathList();
	
}
SmartRuleCreator.prototype.scanExistingRules = function ()
{
	this.matchedRules = new Array();
	if (!this.appliedRuleList) return;
	for (var i=0; i<this.appliedRuleList.length; i++)
	{
		var rule = this.appliedRuleList[i];
		if (this.isMatched(rule))
			this.matchedRules.push(rule);
	}
};

// Compare with existing rules
SmartRuleCreator.prototype.isMatched = function (rule)
{
	var searchNodes;
	if (rule.block_anyway)
	{
		searchNodes = (rule.hide_block_by_css)?
				CustomBlockerUtil.getElementsByCssSelector(rule.hide_block_css)
				:
				CustomBlockerUtil.getElementsByXPath(rule.hide_block_xpath);
	
	}
	else
	{
		searchNodes = (rule.search_block_by_css)?
				CustomBlockerUtil.getElementsByCssSelector(rule.search_block_css)
				:
				CustomBlockerUtil.getElementsByXPath(rule.search_block_xpath);
	}
	for (var i=0; i<searchNodes.length; i++)
	{
		if (CustomBlockerUtil.isContained(this.targetElement, searchNodes[i]))
			return true;
	}
	return false;
};
var SmartRuleCreatorDialog = function (_zIndex, smartRuleEditorSrc)
{
	this.smartRuleEditorSrc = smartRuleEditorSrc;
	this.div = document.createElement('DIV');
	this.div.id = 'smart_rule_creator_dialog';
	this.div.avoidStyle = true;
	this.div.style.zIndex = _zIndex;
	with (this.div.style) 
	{
		display = 'none';
	}
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
	helpLink.addEventListener('click',CustomBlockerUtil.getShowHelpAction(helpLink.href),false);
	helpLink.href = 'javascript:void(0)';
	document.getElementById('smart_rule_editor_body').style.display = 'none';
	document.getElementById('smart_rule_editor_path_img').src = chrome.extension.getURL('/img/smart_path_preview_img.png');
	
	this.advancedSectionVisible = false;
	
	document.getElementById('smart_rule_editor_save').addEventListener('click', this.getSaveAction(), true);
	document.getElementById('smart_rule_editor_cancel').addEventListener('click', this.getCancelAction(), true);
	document.getElementById('smart_rule_editor_close').addEventListener('click', this.getCloseAction(), true);
	
	
	document.getElementById('smart_rule_editor_keyword_add').addEventListener('click', this.getAddKeywordAction(), true);
	document.getElementById('smart_rule_editor_advanced_link').addEventListener('click', this.getToggleAdvancedAction(), true);
	
	// UI definition
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
	this.input_search_block_description = document.getElementById('smart_rule_editor_search_block_description');
	this.input_hide_block_xpath = document.getElementById('smart_rule_editor_hide_block_xpath');
	this.input_hide_block_css = document.getElementById('smart_rule_editor_hide_block_css');
	this.input_hide_block_description = document.getElementById('smart_rule_editor_hide_block_description');
	
	this.input_keyword.focus();
	
	// XPath & CSS radio buttons
	this.radio_search_css.addEventListener('change', this.setPathInputVisibility, true);
	this.radio_search_xpath.addEventListener('change', this.setPathInputVisibility, true);
	this.radio_hide_css.addEventListener('change', this.setPathInputVisibility, true);
	this.radio_hide_xpath.addEventListener('change', this.setPathInputVisibility, true);

	this.input_keyword.addEventListener ('keydown', this.getAddWordAction(), true);
	
	document.body.addEventListener('mouseup', this.getOnMouseupAction(), false);
	document.body.addEventListener('mousemove', this.getOnMousemoveAction(), false);
};
/* Finish Dragging */
SmartRuleCreatorDialog.prototype.getOnMouseupAction = function ()
{
	var self = this;
	return function (event)
	{
		self.moving = false;
	};
};
/* Finish Dragging */
SmartRuleCreatorDialog.prototype.getOnMousemoveAction = function ()
{
	var self = this;
	return function (event)
	{
		if (!self.moving) return;
		self.div.style.left = (self.origDivX+(event.pageX - self.origEventX)) + 'px';
		self.div.style.top = (self.origDivY+(event.pageY - self.origEventY)) + 'px';
		self.adjustEditDivPosition();
	};
};
/* Start Dragging */
SmartRuleCreatorDialog.prototype.getOnMousedownAction = function ()
{
	var self = this;
	return function (event)
	{
		self.moving = true;
		self.origEventX = event.pageX;
		self.origEventY = event.pageY;
		self.origDivX = parseInt(self.div.style.left.replace('px',''));
		self.origDivY = parseInt(self.div.style.top.replace('px',''));
	};
};

SmartRuleCreatorDialog.prototype.getCloseAction = function ()
{
	var self = this;
	return function (event)
	{
		window.elementHighlighter.highlightRule(null);
		self.div.style.display = 'none';
		self.cancelEditing();
		RuleExecutor.reloadRules();
	};
};

SmartRuleCreatorDialog.prototype.getCancelAction = function ()
{
	var self = this;
	return function (event)
	{
		self.cancelEditing();
	};
};
SmartRuleCreatorDialog.prototype.cancelEditing = function ()
{
	this.isEditing = false;
	this.ruleSelected = false;
	this.isEditing = false;
	this.activeLiElement.className = 'option';
	this.ul.className = 'active';
	this.activeLiElement = null;
	document.getElementById('smart_rule_editor_preview').style.display = 'block';
	document.getElementById('smart_rule_editor_body').style.display = 'none';
};
SmartRuleCreatorDialog.prototype.getAddWordAction = function ()
{
	var self = this;
	return function(event)
	{
		if (KEY_CODE_RETURN==event.keyCode) 
		{
			self.addWord(self.input_keyword.value);
			self.input_keyword.value = '';
		}
	};
};
SmartRuleCreatorDialog.prototype.getToggleAdvancedAction  = function ()
{
	var self = this;
	return function (event)
	{
		self.advancedSectionVisible = !self.advancedSectionVisible;
		document.getElementById('smart_rule_editor_advanced').style.display = (self.advancedSectionVisible)?'block':'none';
		document.getElementById('smart_rule_editor_advanced_link').innerHTML = 
			chrome.i18n.getMessage(
				(self.advancedSectionVisible)?'smartRuleEditorHideAdvancedMode':'smartRuleEditorShowAdvancedMode'
				);
	}
}
SmartRuleCreatorDialog.prototype.getAddKeywordAction  = function ()
{
	var self = this;
	return function (event)
	{
		self.addWord(self.input_keyword.value);
		self.input_keyword.value = '';
		self.input_keyword.focus();
	}
};
SmartRuleCreatorDialog.prototype.getSaveAction  = function ()
{
	var self = this;
	return function (event)
	{
		self.saveRule();
	}
};
SmartRuleCreatorDialog.prototype.saveRule  = function ()
{
	var validateErrors = this.validate();
	if (validateErrors.length>0)
	{
		this.showMessage(validateErrors.join('<br/>'));
		return;
	}
	// set UUIDs
	if (CustomBlockerUtil.isEmpty(this.rule.user_identifier))
	{
		this.rule.user_identifier = UUID.generate();
	}
	if (CustomBlockerUtil.isEmpty(this.rule.global_identifier))
	{
		this.rule.global_identifier = UUID.generate();
	}
	this.applyInput();	
	// Save
	var _hideNodes = this.rule.hideNodes;
	var _searchNodes = this.rule.searchNodes;
	this.rule.hideNodes = null;
	this.rule.searchNodes = null;
	window.bgProcessor.sendRequest('db', {dbCommand:'save', type:'rule', obj: this.rule}, 'ruleSaveDoneRuleSmart');
	this.rule.hideNodes = _hideNodes;
	this.rule.searchNodes = _searchNodes;
};
SmartRuleCreatorDialog.prototype.validate = function ()
{
	return Rule.Validator.validate({
		title : this.input_title.value,
		site_regexp : this.input_url.value,
		example_url : this.input_example_url.value,
		site_description : this.input_site_description.value,
		
		search_block_xpath : this.input_search_block_xpath.value,
		search_block_css : this.input_search_block_css.value,
		search_block_description : this.input_search_block_description.value,
		
		this.input_hide_block_xpath.value,
		hide_block_css : this.input_hide_block_css.value,
		hide_block_description : this.input_hide_block_description.value
	});
};
SmartRuleCreatorDialog.prototype.applyInput = function ()
{
	// Set form values to rule
	this.rule.title = this.input_title.value;
	this.rule.site_regexp = this.input_url.value;
	this.rule.site_description = this.input_site_description.value;
	this.rule.example_url = this.input_example_url.value;
	this.rule.search_block_xpath = this.input_search_block_xpath.value;
	this.rule.search_block_css = this.input_search_block_css.value;
	this.rule.search_block_description = this.input_search_block_description.value;
	this.rule.hide_block_xpath = this.input_hide_block_xpath.value;
	this.rule.hide_block_css = this.input_hide_block_css.value;
	this.rule.hide_block_description = this.input_hide_block_description.value;
};
SmartRuleCreatorDialog.prototype.onSaveDone = function (rule)
{
	this.rule.rule_id = rule.rule_id;
	for (var i=0, l=this.rule.words.length; i<l; i++)
	{
		this.rule.words[i].word_id = rule.words[i].word_id;
	}
	this.showMessage(chrome.i18n.getMessage('saveDone'));
};
/**
 * Create and show list of applied rules and suggested paths
 */
SmartRuleCreatorDialog.prototype.show = function (/*SmartRuleCreator*/creator, target, event)
{
	CustomBlockerUtil.clearChildren(this.ul);
	this.div.style.display = 'block';
	
	if (null!=creator.matchedRules && creator.matchedRules.length>0)
	{
		{
			// Header of "Existing Rules" section
			var li = document.createElement('LI');
			li.innerHTML = chrome.i18n.getMessage('ruleEditorExistingRules');
			li.className = 'smartEditorSectionTitle';
			this.ul.appendChild(li);
			// Draggable
			li.addEventListener('mousedown', this.getOnMousedownAction(), true);
		}
		for (var i=0; i<creator.matchedRules.length; i++)
		{
			// Existing rule
			var rule = creator.matchedRules[i];
			if (!rule.hideNodes) rule.hideNodes = new Array();
			if (!rule.searchNodes) rule.searchNodes = new Array();
			var li = this.createLiElement(CustomBlockerUtil.shorten(rule.title,19), rule.hideNodes.length, rule.searchNodes.length, chrome.i18n.getMessage('smartRuleEditorExistingButtonLabel'));
			li.title = CustomBlockerUtil.getRuleDetailTip(rule);
			li.addEventListener('mouseover', this.getExistingRuleHoverAction(rule, li), true);
			li.addEventListener('click', this.getExistingRuleClickAction(rule, li), true);
			this.ul.appendChild(li);
		}
	}
	if (creator.suggestedPathList && creator.suggestedPathList.length>0)
	{
		// Header of "New Rules" section
		var sectionLi = document.createElement('LI');
		sectionLi.innerHTML = chrome.i18n.getMessage('ruleEditorNewRules');
		sectionLi.className = 'smartEditorSectionTitle';
		// Draggable
		sectionLi.addEventListener('mousedown', this.getOnMousedownAction(), true);
		this.ul.appendChild(sectionLi);
		for (var i=0; i<creator.suggestedPathList.length; i++)
		{
			// New rule
			var path = creator.suggestedPathList[i];
			path.title = chrome.i18n.getMessage('smartRuleEditorSuggestedTitlePrefix') + (i + 1);
			var li = this.createLiElement(path.title, path.hidePath.elements.length, path.searchPath.elements.length,  chrome.i18n.getMessage('smartRuleEditorSuggestedButtonLabel'));
			li.addEventListener('mouseover', this.getSuggestedPathHoverAction(path, li), true);
			li.addEventListener('click', this.getSuggestedPathClickAction(path, li), true);
			li.className = 'option';
			this.ul.appendChild(li);
			
		}
			
	}
	this.input_keyword.value = creator.selectionText || '';
	var _left = Math.min(event.clientX + document.body.scrollLeft, document.body.clientWidth - 190);
	var _top = event.clientY + document.body.scrollTop;
	this.div.style.left = _left + 'px';
	this.div.style.top = _top + 'px';
	// Set "avoidStyle" flags not to be highlighted.
	var divElements = this.div.getElementsByTagName('*');
	this.div.avoidStyle = true;
	for (var i=0; i<divElements.length; i++)
	{
		divElements[i].avoidStyle = true;
	}
};
SmartRuleCreatorDialog.prototype.createLiElement = function (title, hideCount, searchCount, buttonTitle)
{
	var li = document.createElement('LI');
	var spanHideCount = document.createElement('SPAN');
	spanHideCount.className = 'hideCount';
	spanHideCount.innerHTML = hideCount;
	var spanSearchCount = document.createElement('SPAN');
	spanSearchCount.className = 'searchCount';
	spanSearchCount.innerHTML = searchCount;
	var spanTitle = document.createElement('SPAN');
	spanTitle.innerHTML = title;
	
	var button = document.createElement('INPUT');
	button.type = 'button';
	button.value = buttonTitle;
		
	li.appendChild(spanHideCount);
	li.appendChild(spanSearchCount);
	li.appendChild(spanTitle);
	li.appendChild(button);
	
	li.className = 'option';
	return li;
};
SmartRuleCreatorDialog.prototype.showEdit = function (liElement)
{
	this.editDiv.style.top = (liElement.offsetTop - 20) + 'px';
	this.editDiv.style.display = 'block';
	this.adjustEditDivPosition();
};
SmartRuleCreatorDialog.prototype.adjustEditDivPosition = function ()
{
	
	var centerX = this.div.clientLeft + 90;
	var shouldShowDialogRight = centerX < document.body.clientWidth/2;
	var shouldShowDialogRight = event.clientX < document.body.clientWidth/2;
	this.editDiv.style.left = 
		((shouldShowDialogRight)? this.div.clientWidth : -this.editDiv.clientWidth-4) 
		+ 'px';
};
SmartRuleCreatorDialog.PREVIEW_PATH_WIDTH = 28;
/**
 * Test & Select Existing Rules
 */
SmartRuleCreatorDialog.prototype.getExistingRuleHoverAction = function (rule, liElement)
{
	var self = this;
	return function (event)
	{
		if (self.ruleSelected)
			return;
		self.showEdit(liElement);
		self.previewExistingRule(rule);
	}
};
SmartRuleCreatorDialog.prototype.previewExistingRule = function (rule)
{
	window.elementHighlighter.highlightRule(rule);
	document.getElementById('smart_rule_editor_preview_title').innerHTML = rule.title;
	document.getElementById('smart_rule_editor_preview_hide_count').innerHTML = rule.hideNodes.length;
	document.getElementById('smart_rule_editor_preview_hide_path').innerHTML = 
		CustomBlockerUtil.shorten(((rule.hide_block_by_css)?
			rule.hide_block_css:rule.hide_block_xpath), SmartRuleCreatorDialog.PREVIEW_PATH_WIDTH);
	document.getElementById('smart_rule_editor_preview_search_count').innerHTML = rule.searchNodes.length;
	document.getElementById('smart_rule_editor_preview_search_path').innerHTML = 
		CustomBlockerUtil.shorten(((rule.search_block_by_css)?
			rule.search_block_css:rule.search_block_xpath), SmartRuleCreatorDialog.PREVIEW_PATH_WIDTH);
	CustomBlockerUtil.clearChildren(document.getElementById('smart_rule_editor_preview_keywords'));
	document.getElementById('smart_rule_editor_preview_suggested').style.display = 'none';
	for (var i=0; i<rule.words.length; i++)
	{
		var keywordsDiv = document.getElementById('smart_rule_editor_preview_keywords');
		keywordsDiv.appendChild(CustomBlockerUtil.createSimpleWordElement(rule.words[i]));
		keywordsDiv.appendChild(document.createTextNode(' '));
	}
};
SmartRuleCreatorDialog.prototype.getExistingRuleClickAction = function (rule, li)
{
	var self = this;
	return function (event)
	{
		if (self.isEditing)
			return;
		self.isEditing = true;
		self.activeLiElement = li;
		li.className = 'option selected';
		self.rule = rule;
		self.showEdit(li);
		self.showRule(rule);
	}	
};
/**
 * Test & Select Suggested Rules
 */
SmartRuleCreatorDialog.prototype.getSuggestedPathHoverAction = function (path, liElement)
{
	var self = this;
	return function (event)
	{
		if (self.ruleSelected)
			return;
		window.elementHighlighter.highlightHideElements(path.hidePath.elements);
		window.elementHighlighter.highlightSearchElements(path.searchPath.elements);
		self.showEdit(liElement);
		self.previewSuggestedPath(path);
	}	
};
SmartRuleCreatorDialog.prototype.previewSuggestedPath = function (path)
{
	document.getElementById('smart_rule_editor_preview_title').innerHTML = path.title;
	
	document.getElementById('smart_rule_editor_preview_suggested').style.display = 'block';
	document.getElementById('smart_rule_editor_preview_hide_count').innerHTML = path.hidePath.elements.length;
	document.getElementById('smart_rule_editor_preview_hide_path').innerHTML = 
		CustomBlockerUtil.shorten(path.hidePath.path, SmartRuleCreatorDialog.PREVIEW_PATH_WIDTH);
	document.getElementById('smart_rule_editor_preview_search_count').innerHTML = path.searchPath.elements.length;
	document.getElementById('smart_rule_editor_preview_search_path').innerHTML = 
		CustomBlockerUtil.shorten(path.searchPath.path, SmartRuleCreatorDialog.PREVIEW_PATH_WIDTH);
	CustomBlockerUtil.clearChildren(document.getElementById('smart_rule_editor_preview_keywords'));

};
SmartRuleCreatorDialog.prototype.getSuggestedPathClickAction = function (path, li)
{
	var self = this;
	return function (event)
	{
		if (self.isEditing)
			return;
		self.isEditing = true;
		self.activeLiElement = li;
		li.className = 'option selected';
		self.rule = self.createRuleByPath(path);
		self.showEdit(li);
		self.showRule(self.rule);
	}	
};
SmartRuleCreatorDialog.prototype.createRuleByPath = function (path)
{
	var rule = Rule.createInstance();
	rule.search_block_by_css = true;
	rule.hide_block_by_css = true;
	rule.title = path.title;
	rule.example_url = location.href;
	rule.site_description = document.title;
	rule.site_regexp = CustomBlockerUtil.getSuggestedSiteRegexp();
	rule.search_block_css = path.searchPath.path;
	rule.search_block_xpath = null;
	rule.search_block_description = null;
	rule.hide_block_css = path.hidePath.path;
	rule.hide_block_xpath = null;
	rule.hide_block_description = null;
	return rule;
};
SmartRuleCreatorDialog.prototype.showRule = function (rule)
{
	this.ul.className = '';
	this.ruleSelected = true;
	document.getElementById('smart_rule_editor_preview').style.display = 'none';
	document.getElementById('smart_rule_editor_body').style.display = 'block';
	
	this.input_example_url.value = rule.example_url;
	this.input_site_description.value = rule.site_description;
	this.input_title.value = rule.title;
	this.input_url.value = rule.site_regexp;
	this.input_search_block_xpath.value = rule.search_block_xpath;
	this.input_search_block_css.value = rule.search_block_css;
	this.input_search_block_description.value = rule.search_block_description;
	this.input_hide_block_xpath.value = rule.hide_block_xpath;
	this.input_hide_block_css.value = rule.hide_block_css;
	this.input_hide_block_description.value = rule.hide_block_description;
	CustomBlockerUtil.clearChildren(this.input_keyword);
	
	var searchRadio = (rule.search_block_by_css)?this.radio_search_css:this.radio_search_xpath;
	searchRadio.checked = true;
	var hideRadio = (rule.hide_block_by_css)?this.radio_hide_css:this.radio_hide_xpath;
	var hideRadio.checked = true;
	this.setPathInputVisibility();
	
	for (var i=0; i<rule.words.length; i++)
	{
		document.getElementById('smart_rule_editor_keywords').appendChild(this.getWordElement(rule.words[i]));
	}
	this.input_title.focus();
};
SmartRuleCreatorDialog.prototype.setPathInputVisibility = function ()
{
	this.input_search_block_css.style.display = (this.radio_search_css.checked)?'inline':'none';
	this.input_search_block_xpath.style.display = (this.radio_search_xpath.checked)?'inline':'none';
	
	document.getElementById('smart_rule_editor_search_block_css_label').style.display
		= (this.radio_search_css.checked)?'inline':'none';
	document.getElementById('smart_rule_editor_search_block_xpath_label').style.display
		= (this.radio_search_xpath.checked)?'inline':'none';
		
	this.input_hide_block_css.style.display = (this.radio_hide_css.checked)?'inline':'none';
	this.input_hide_block_xpath.style.display = (this.radio_hide_xpath.checked)?'inline':'none';
	
	document.getElementById('smart_rule_editor_hide_block_css_label').style.display
		= (this.radio_hide_css.checked)?'inline':'none';
	document.getElementById('smart_rule_editor_hide_block_xpath_label').style.display
		= (this.radio_hide_xpath.checked)?'inline':'none';
};
SmartRuleCreatorDialog.prototype.getWordElement = function (word) 
{
	return CustomBlockerUtil.createWordElement(word, this.getWordDeleteAction(word));
};
SmartRuleCreatorDialog.prototype.getWordDeleteAction = function (word) 
{
	var self = this;
	return function (span) 
	{
		span.parentNode.removeChild(span);
		word.deleted = true;
		word.dirty = true;
	};
};

SmartRuleCreatorDialog.prototype.addWord = function(wordStr)
{
	if (!wordStr || ''==wordStr) return; //Empty
	var word = new Word();
	
	word.word = wordStr;
	word.isNew = 'true';
	var checked = document.getElementById('smart_rule_editor_keyword_regexp').checked;
	word.is_regexp = checked;
	
	word.dirty = true;
	
	var span = this.getWordElement(word)
	document.getElementById('smart_rule_editor_keywords').appendChild(span);
	
	this.rule.words.push(word);
	
	if (this.rule.rule_id>0) 
	{
		word.rule_id = this.rule.rule_id;
	}
	else 
	{
		word.rule_id=0;
	}
};

SmartRuleCreatorDialog.prototype.showMessage = function (message)
{
	var div = document.getElementById('smart_rule_editor_alert');
	div.style.display = 'block';
	div.innerHTML = message;
};