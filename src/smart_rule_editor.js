
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
	try
	{
		this.scanExistingRules();
	}
	catch (ex)
	{
		console.log(ex);
	}
	this.createNewRules();
};
SmartRuleCreator.prototype.createNewRules = function ()
{
	var analyzer = new SmartPathAnalyzer(this.targetElement, new CssBuilder());
	this.suggestedPathList = analyzer.createPathList();
	
}
SmartRuleCreator.prototype.scanExistingRules = function ()
{
	this.matchedRules = new Array();
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
	var searchNodes = (rule.search_block_by_css)?
				CustomBlockerUtil.getElementsByCssSelector(rule.search_block_css)
				:
				CustomBlockerUtil.getElementsByXPath(rule.search_block_xpath);
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
	this.advancedSectionVisible = false;
	document.getElementById('smart_rule_editor_save').addEventListener('click', this.getSaveAction(), true);
	document.getElementById('smart_rule_editor_cancel').addEventListener('click', this.getCancelAction(), true);
	document.getElementById('smart_rule_editor_keyword_add').addEventListener('click', this.getAddKeywordAction(), true);
	document.getElementById('smart_rule_editor_advanced_link').addEventListener('click', this.getToggleAdvancedAction(), true);
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
	// Set form values to rule
	this.rule.site_regexp = document.getElementById('smart_rule_editor_example_url').value;
	this.rule.site_description = document.getElementById('smart_rule_editor_site_description').value;
	this.rule.example_url = document.getElementById('smart_rule_editor_example_url').value;
	this.rule.title = document.getElementById('smart_rule_editor_title').value;
	this.rule.search_block_css = document.getElementById('smart_rule_editor_search').value;
	this.rule.hide_block_css = document.getElementById('smart_rule_editor_hide').value;

	//TODO validation
	
	// Save
	this.bgCallback({command:'save', type:'rule', obj: this.rule});
};
SmartRuleCreatorDialog.prototype.getCancelAction  = function ()
{
	return function (event)
	{
		console.log("TODO cancel");
	}

};
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
			var li = document.createElement('LI');
			li.className = 'option';
			li.innerHTML = rule.title;
			li.addEventListener('mouseover', this.getExistingRuleHoverAction(rule, li), true);
			li.addEventListener('click', this.getExistingRuleClickAction(rule), true);
			this.ul.appendChild(li);
		}
	}
	{
		var li = document.createElement('LI');
		li.innerHTML = chrome.i18n.getMessage('ruleEditorNewRules');
		li.className = 'smartEditorSectionTitle';
		this.ul.appendChild(li);
	}
	for (var i=0; i<creator.suggestedPathList.length; i++)
	{
		var path = creator.suggestedPathList[i];
		path.title = chrome.i18n.getMessage('smartRuleEditorSuggestedTitlePrefix') + (i + 1);
		var li = document.createElement('LI');
		li.innerHTML = path.title;
		li.addEventListener('mouseover', this.getSuggestedPathHoverAction(path, li), true);
		li.addEventListener('click', this.getSuggestedPathClickAction(path), true);
		li.className = 'option';
		this.ul.appendChild(li);
		
	}
	document.getElementById('smart_rule_editor_keyword').value = creator.selectionText || '';
	this.shouldShowDialogRight = event.clientX < (document.body.clientWidth/2 - this.div.clientWidth/2);
	var _left = event.clientX + document.body.scrollLeft;
	var _top = event.clientY + document.body.scrollTop;
	this.div.style.left = _left + 'px';
	this.div.style.top = _top + 'px';
	
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
/**
 * Test & Select Existing Rules
 */
SmartRuleCreatorDialog.prototype.getExistingRuleHoverAction = function (rule, liElement)
{
	var self = this;
	return function (event)
	{
		self.showEdit(liElement);
	}
};
SmartRuleCreatorDialog.prototype.getExistingRuleClickAction = function (rule)
{
	var self = this;
	return function (event)
	{
		self.rule = rule;
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
		window.elementHighlighter.highlightHideElements(path.hidePath.elements);
		window.elementHighlighter.highlightSearchElements(path.searchPath.elements);
		self.showEdit(liElement);
	}	
};
SmartRuleCreatorDialog.prototype.getSuggestedPathClickAction = function (path)
{
	var self = this;
	return function (event)
	{
		self.rule = self.createRuleByPath(path);
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
	rule.hide_block_css = path.hidePath.path;
	return rule;
};
SmartRuleCreatorDialog.prototype.showRule = function (rule)
{
	document.getElementById('smart_rule_editor_example_url').value = rule.example_url;
	document.getElementById('smart_rule_editor_site_description').value = rule.site_description;
	document.getElementById('smart_rule_editor_title').value = rule.title;
	document.getElementById('smart_rule_editor_url').value = rule.site_regexp;
	document.getElementById('smart_rule_editor_search').value = rule.search_block_css;
	document.getElementById('smart_rule_editor_hide').value = rule.hide_block_css;
	CustomBlockerUtil.clearChildren(document.getElementById('rule_editor_keywords'));
	for (var i=0; i<rule.words.length; i++)
	{
		document.getElementById('rule_editor_keywords').appendChild(this.getWordElement(rule.words[i]));
	}
	document.getElementById('smart_rule_editor_title').focus();
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