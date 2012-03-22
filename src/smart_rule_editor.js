
/**
 * SmartRuleCreator
 */
var SmartRuleCreator = function (targetElement, appliedRuleList)
{
	CustomBlockerUtil.applyCss('/smart_rule_editor.css');
	this.appliedRuleList = appliedRuleList;
	this.targetElement = targetElement;
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
	document.getElementById('smart_rule_editor_save').addEventListener('click', this.getSaveAction(), true);
	document.getElementById('smart_rule_editor_cancel').addEventListener('click', this.getCancelAction(), true);
	document.getElementById('smart_rule_editor_keywords').addEventListener('click', this.getAddKeywordAction(), true);
};
SmartRuleCreatorDialog.prototype.getAddKeywordAction  = function ()
{
	return function (event)
	{
		console.log("TODO add keyword");
	}
};
SmartRuleCreatorDialog.prototype.getSaveAction  = function ()
{
	var self = this;
	return function (event)
	{
		self.bgCallback({command:'save', type:'rule', obj: self.rule});
	}
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
	var _left = event.clientX + document.body.scrollLeft;
	var _top = event.clientY + document.body.scrollTop;
	this.div.style.left = _left + 'px';
	this.div.style.top = _top + 'px';
	
};
/**
 * Test & Select Existing Rules
 */
SmartRuleCreatorDialog.prototype.getExistingRuleHoverAction = function (rule, liElement)
{
	var self = this;
	return function ()
	{
		//TODO
		self.editDiv.style.top = (liElement.offsetTop - 20) + 'px';
		self.editDiv.style.display = 'block';
		console.log("Tested rule: " + rule.title);
	}
};
SmartRuleCreatorDialog.prototype.getExistingRuleClickAction = function (rule)
{
	var self = this;
	return function ()
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
	return function ()
	{
		window.elementHighlighter.highlightHideElements(path.hidePath.elements);
		window.elementHighlighter.highlightSearchElements(path.searchPath.elements);
		self.editDiv.style.top = (liElement.offsetTop - 20) + 'px';
		self.editDiv.style.display = 'block';
	}	
};
SmartRuleCreatorDialog.prototype.getSuggestedPathClickAction = function (path)
{
	var self = this;
	return function ()
	{
		self.rule = self.createRuleByPath(path);
		self.showRule(self.rule);
	}	
};
SmartRuleCreatorDialog.prototype.createRuleByPath = function (path)
{
	var rule = Rule.createInstance();
	rule.title = path.title;
	rule.site_regexp = CustomBlockerUtil.getSuggestedSiteRegexp();
	rule.search_block_css = path.searchPath.path;
	rule.hide_block_css = path.hidePath.path;
	return rule;
};
SmartRuleCreatorDialog.prototype.showRule = function (rule)
{
	document.getElementById('smart_rule_editor_title').value = rule.title;
	document.getElementById('smart_rule_editor_url').value = rule.site_regexp;
	document.getElementById('smart_rule_editor_search').value = rule.search_block_css;
	document.getElementById('smart_rule_editor_hide').value = rule.hide_block_css;
	alert("Rule.title=" + rule.title);
};