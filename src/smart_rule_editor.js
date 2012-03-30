
/**
 * SmartRuleCreator
 */
var SmartRuleCreator = function (targetElement, appliedRuleList, selectionText)
{
	CustomBlockerUtil.applyCss('/smart_rule_editor.css');
	CustomBlockerUtil.applyCss('/keywords.css');
	this.appliedRuleList = appliedRuleList;
	this.targetElement = targetElement;
	this.selectionText = selectionText;
	this.scanExistingRules(); //ここでおちた!
	this.createNewRules();
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
var SmartRuleCreatorDialog = function (_zIndex, ruleEditor, smartRuleEditorSrc)
{
	this.smartRuleEditorSrc = smartRuleEditorSrc;
	this.ruleEditor = ruleEditor;
	this.div = document.createElement('DIV');
	this.div.id = 'smart_rule_creator_dialog';
	this.div.avoidStyle = true;
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
		editDiv.style.zIndex = _zIndex;
		editDiv.style.display = 'none';
		editDiv.innerHTML = this.smartRuleEditorSrc;
		this.div.appendChild(editDiv);
	}
	document.getElementById('smart_rule_editor_body').style.display = 'none';
	document.getElementById('smart_rule_editor_path_img').src = chrome.extension.getURL('/img/smart_path_preview_img.png');
	
	this.advancedSectionVisible = false;
	
	document.getElementById('smart_rule_editor_save').addEventListener('click', this.getSaveAction(), true);
	document.getElementById('smart_rule_editor_cancel').addEventListener('click', this.getCancelAction(), true);
	document.getElementById('smart_rule_editor_keyword_add').addEventListener('click', this.getAddKeywordAction(), true);
	document.getElementById('smart_rule_editor_advanced_link').addEventListener('click', this.getToggleAdvancedAction(), true);
	
	document.getElementById('smart_rule_editor_radio_search_css').addEventListener('change', this.setPathInputVisibility, true);
	document.getElementById('smart_rule_editor_radio_search_xpath').addEventListener('change', this.setPathInputVisibility, true);
	document.getElementById('smart_rule_editor_radio_hide_css').addEventListener('change', this.setPathInputVisibility, true);
	document.getElementById('smart_rule_editor_radio_hide_xpath').addEventListener('change', this.setPathInputVisibility, true);

	
	document.getElementById('smart_rule_editor_keyword').addEventListener ('keydown', this.getAddWordAction(), true);
};
SmartRuleCreatorDialog.prototype.getAddWordAction = function ()
{
	var self = this;
	return function(e)
	{
		if (KEY_CODE_RETURN==e.keyCode) 
		{
			self.addWord(document.getElementById('smart_rule_editor_keyword').value);
			document.getElementById('smart_rule_editor_keyword').value = '';
		}
	}
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
		var keywordInput = document.getElementById('smart_rule_editor_keyword');
		self.addWord(keywordInput.value);
		keywordInput.value = '';
		keywordInput.focus();
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
	this.applyInput();	
	// Save
	this.bgCallback({command:'save', type:'rule', obj: this.rule});
};
SmartRuleCreatorDialog.prototype.validate = function ()
{
	return Rule.Validator.validate({
		title : document.getElementById('smart_rule_editor_title').value,
		site_regexp : document.getElementById('smart_rule_editor_example_url').value,
		example_url : document.getElementById('smart_rule_editor_example_url').value,
		site_description : document.getElementById('smart_rule_editor_site_description').value,
		
		search_block_xpath : document.getElementById('smart_rule_editor_search_block_xpath').value,
		search_block_css : document.getElementById('smart_rule_editor_search_block_css').value,
		search_block_description : document.getElementById('smart_rule_editor_search_block_description').value,
		
		hide_block_xpath : document.getElementById('smart_rule_editor_hide_block_xpath').value,
		hide_block_css : document.getElementById('smart_rule_editor_hide_block_css').value,
		hide_block_description : document.getElementById('smart_rule_editor_hide_block_description').value
	});
};
SmartRuleCreatorDialog.prototype.applyInput = function ()
{
	// Set form values to rule
	this.rule.title = document.getElementById('smart_rule_editor_title').value;
	this.rule.site_regexp = document.getElementById('smart_rule_editor_example_url').value;
	this.rule.site_description = document.getElementById('smart_rule_editor_site_description').value;
	this.rule.example_url = document.getElementById('smart_rule_editor_example_url').value;
	this.rule.search_block_xpath = document.getElementById('smart_rule_editor_search_block_xpath').value;
	this.rule.search_block_css = document.getElementById('smart_rule_editor_search_block_css').value;
	this.rule.search_block_description = document.getElementById('smart_rule_editor_search_block_description').value;
	this.rule.hide_block_xpath = document.getElementById('smart_rule_editor_hide_block_xpath').value;
	this.rule.hide_block_css = document.getElementById('smart_rule_editor_hide_block_css').value;
	this.rule.hide_block_description = document.getElementById('smart_rule_editor_hide_block_description').value;
};
SmartRuleCreatorDialog.prototype.getCancelAction  = function ()
{
	return function (event)
	{
		console.log("TODO cancel");
	}

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
			var li = document.createElement('LI');
			li.innerHTML = chrome.i18n.getMessage('ruleEditorExistingRules');
			li.className = 'smartEditorSectionTitle';
			this.ul.appendChild(li);
		}
		for (var i=0; i<creator.matchedRules.length; i++)
		{
			var rule = creator.matchedRules[i];
			if (!rule.hideNodes) rule.hideNodes = new Array();
			if (!rule.searchNodes) rule.searchNodes = new Array();
			var li = this.createLiElement(rule.title, rule.hideNodes.length, rule.searchNodes.length);
			li.addEventListener('mouseover', this.getExistingRuleHoverAction(rule, li), true);
			li.addEventListener('click', this.getExistingRuleClickAction(rule, li), true);
			this.ul.appendChild(li);
		}
	}
	if (creator.suggestedPathList && creator.suggestedPathList.length>0){
		var li = document.createElement('LI');
		li.innerHTML = chrome.i18n.getMessage('ruleEditorNewRules');
		li.className = 'smartEditorSectionTitle';
		this.ul.appendChild(li);
		for (var i=0; i<creator.suggestedPathList.length; i++)
		{
			var path = creator.suggestedPathList[i];
			path.title = chrome.i18n.getMessage('smartRuleEditorSuggestedTitlePrefix') + (i + 1);
			var li = this.createLiElement(path.title, path.hidePath.elements.length, path.searchPath.elements.length);
			li.addEventListener('mouseover', this.getSuggestedPathHoverAction(path, li), true);
			li.addEventListener('click', this.getSuggestedPathClickAction(path, li), true);
			li.className = 'option';
			this.ul.appendChild(li);
			
		}
			
	}
	document.getElementById('smart_rule_editor_keyword').value = creator.selectionText || '';
	this.shouldShowDialogRight = event.clientX < document.body.clientWidth/2;
	var _left = event.clientX + document.body.scrollLeft;
	var _top = event.clientY + document.body.scrollTop;
	this.div.style.left = _left + 'px';
	this.div.style.top = _top + 'px';
	// Set "avoidStyle" flags not to be highlighted.
	var divElements = this.div.getElementsByTagName('*');
	this.div.avoidStyle = true;
	for (var i=0; i<divElements.length; i++)
		divElements[i].avoidStyle = true;
};
SmartRuleCreatorDialog.prototype.createLiElement = function (title, hideCount, searchCount)
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
	
	li.appendChild(spanHideCount);
	li.appendChild(spanSearchCount);
	li.appendChild(spanTitle);
	
	li.className = 'option';
	return li;
};
SmartRuleCreatorDialog.prototype.showEdit = function (liElement)
{
	this.editDiv.style.top = (liElement.offsetTop - 20) + 'px';
	this.editDiv.style.display = 'block';
	
	this.editDiv.style.left = 
		((this.shouldShowDialogRight)?
			this.div.clientWidth : -this.editDiv.clientWidth-4) 
		+ 'px';
};
SmartRuleCreatorDialog.PREVIEW_PATH_WIDTH = 26;
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
	for (var i=0; i<rule.words.length; i++)
	{
		document.getElementById('smart_rule_editor_preview_keywords').appendChild(
			CustomBlockerUtil.createSimpleWordElement(rule.words[i])
			);
	}
};
SmartRuleCreatorDialog.prototype.getExistingRuleClickAction = function (rule, li)
{
	var self = this;
	return function (event)
	{
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
	
	document.getElementById('smart_rule_editor_example_url').value = rule.example_url;
	document.getElementById('smart_rule_editor_site_description').value = rule.site_description;
	document.getElementById('smart_rule_editor_title').value = rule.title;
	document.getElementById('smart_rule_editor_url').value = rule.site_regexp;
	document.getElementById('smart_rule_editor_search_block_xpath').value = rule.search_block_xpath;
	document.getElementById('smart_rule_editor_search_block_css').value = rule.search_block_css;
	document.getElementById('smart_rule_editor_search_block_description').value = rule.search_block_description;
	document.getElementById('smart_rule_editor_hide_block_xpath').value = rule.hide_block_xpath;
	document.getElementById('smart_rule_editor_hide_block_css').value = rule.hide_block_css;
	document.getElementById('smart_rule_editor_hide_block_description').value = rule.hide_block_description;
	CustomBlockerUtil.clearChildren(document.getElementById('rule_editor_keywords'));
	document.getElementById((rule.search_block_by_css)?'smart_rule_editor_radio_search_css':'smart_rule_editor_radio_search_xpath').checked = true;
	document.getElementById((rule.hide_block_by_css)?'smart_rule_editor_radio_hide_css':'smart_rule_editor_radio_hide_xpath').checked = true;
	this.setPathInputVisibility();
	
	for (var i=0; i<rule.words.length; i++)
	{
		document.getElementById('rule_editor_keywords').appendChild(this.getWordElement(rule.words[i]));
	}
	document.getElementById('smart_rule_editor_title').focus();
};
SmartRuleCreatorDialog.prototype.setPathInputVisibility = function ()
{
	document.getElementById('smart_rule_editor_search_block_css').style.display
		= (document.getElementById('smart_rule_editor_radio_search_css').checked)?'inline':'none';
	document.getElementById('smart_rule_editor_search_block_xpath').style.display
		= (document.getElementById('smart_rule_editor_radio_search_xpath').checked)?'inline':'none';
		
	document.getElementById('smart_rule_editor_hide_block_css').style.display
		= (document.getElementById('smart_rule_editor_radio_hide_css').checked)?'inline':'none';
	document.getElementById('smart_rule_editor_hide_block_xpath').style.display
		= (document.getElementById('smart_rule_editor_radio_hide_xpath').checked)?'inline':'none';
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
	document.getElementById('rule_editor_keywords').appendChild(span);
	
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