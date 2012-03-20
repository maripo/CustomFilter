
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
	console.log("matchedRules.length="+this.matchedRules.length);
};
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
		editDiv.innerHTML = this.smartRuleEditorSrc;
		this.div.appendChild(editDiv);
	}
};
SmartRuleCreatorDialog.prototype.show = function (/*SmartRuleCreator*/creator, target, event)
{
	//TODO mouseover action
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
		var li = document.createElement('LI');
		li.innerHTML = i;
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
SmartRuleCreatorDialog.prototype.getSuggestedPathHoverAction = function (path, liElement)
{
	var self = this;
	return function ()
	{
		window.elementHighlighter.highlightHideElements(CustomBlockerUtil.getElementsByXPath(path.hidePath.path));
		window.elementHighlighter.highlightSearchElements(CustomBlockerUtil.getElementsByXPath(path.searchPath.path));
		self.editDiv.style.top = (liElement.offsetTop - 40) + 'px';
	}	
};
SmartRuleCreatorDialog.prototype.getSuggestedPathClickAction = function (path)
{
	return function ()
	{
		//TODO
		alert(path.hidePath.path + "\n" + path.searchPath.path);
	}	
};