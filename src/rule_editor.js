var selectedNode = null;
var origStyle = null;
var origHref = null;

var KEY_CODE_RETURN = 13;
/**
 * RuleEditor
 */
var RuleEditor = function (rule, src) 
{
	this.rule = (rule)?rule:Rule.createInstance();
	this.src = src;
};
RuleEditor.prototype.initialize = function () 
{
	var nodes = document.body.getElementsByTagName('*');
	this.maxZIndex = RuleEditor.getMaxZIndex();
	stopBlockAction();
	
	for (var i=0; i<nodes.length;  i++) 
	{		
		var node = nodes[i];
		node.addEventListener('mouseover', this.getOnMouseoverAction(node), false);
		node.addEventListener('mouseout', this.getOnMouseoutAction(node), false);
		node.addEventListener('click', this.getOnClickAction(node), false);
		RuleElement.appendFunctions(node);
	}
	
	this.pathPickerDialog = new PathPickerDialog(this.maxZIndex + 2, this);
	this.ruleEditorDialog = new RuleEditorDialog(this.rule, this.src, this.maxZIndex + 1, this);
	this.ruleEditorDialog.refreshXPathSelectedStyles();
};

RuleEditor.prototype.getOnMouseoverAction = function (node) 
{
	var self = this;
	return function (event)
	{
		if (selectedNode ==null && self.ruleEditorDialog && self.ruleEditorDialog.xpathPickerTarget) 
		{
			selectedNode = node;
			origStyle = selectedNode.style.outline;
			origHref = selectedNode.href;
			selectedNode.href = 'javascript:void(0)'
			if (self.ruleEditorDialog.xpathPickerTarget == RuleEditorDialog.XPATH_PICKER_TARGET_NONE
					&& selectedNode.unfocus) 
			{
				selectedNode.unfocus();
			}
			else if (self.ruleEditorDialog.xpathPickerTarget == RuleEditorDialog.XPATH_PICKER_TARGET_SEARCH
					&& selectedNode.focusForSearch) 
			{
				selectedNode.focusForSearch();
			}
			else if (self.ruleEditorDialog.xpathPickerTarget == RuleEditorDialog.XPATH_PICKER_TARGET_HIDE 
					&& selectedNode.focusForHide) 
			{
					selectedNode.focusForHide();
			}
			return;
		}
        event.stopPropagation();
		event.preventDefault();
	}
};

RuleEditor.prototype.onSaveDone = function (rule)
{
	this.rule.rule_id = rule.rule_id;
	for (var i=0, l=this.rule.words.length; i<l; i++)
	{
		this.rule.words[i].word_id = rule.words[i].word_id;
	}
	this.ruleEditorDialog.showMessage(chrome.i18n.getMessage('saveDone'));
}

RuleEditor.prototype.getOnClickAction = function (node) 
{
	var self = this;
	return function (event) 
	{
		if (self.ruleEditorDialog.xpathPickerTarget == RuleEditorDialog.XPATH_PICKER_TARGET_NONE)
			return;
		if (selectedNode ==node) 
		{
			var analyzer = new PathAnalyzer(node);
			var list = analyzer.createPathList();
			self.pathPickerDialog.show(event, list, self.ruleEditorDialog.xpathPickerTarget);
		}
        event.stopPropagation();
		event.preventDefault();
	}
};

RuleEditor.prototype.getOnMouseoutAction = function (node) 
{
	return function (event) 
	{
		if (selectedNode) 
		{
			selectedNode.style.outline = origStyle;
			selectedNode.href = origHref;
		}
		selectedNode = null;
	}
};

RuleEditor.getMaxZIndex = function () 
{
	var max = 1;
	var elements = document.getElementsByTagName('*');
	for (var i=0, l=elements.length; i<l; i++) 
	{
		var element = elements[i];
		var style = window.getComputedStyle(element);
		
		if (style && style.zIndex && 'auto'!=style.zIndex && parseInt(style.zIndex)>max)
		{
			max = parseInt(style.zIndex);
		}
	}
	return max;
};
RuleEditor.prototype.getSuggestedXPath = function (_node) 
{
	var node = _node;
	var xpath = node.tagName;
	if (node.className) xpath = node.tagName + '[@class="'+node.className+'"]';
	var idFound = false;
	while (node) 
	{
		if (node.id) 
		{
			xpath = "id('"+node.id+"')//" + xpath;
			idFound = true;
			break;
		} 
		node = node.parentNode;
	}
	if (!idFound) xpath = "//"+xpath ;
	return xpath;
};

RuleEditor.prototype.save = function () 
{
	var validateErrors = Rule.Validator.validate({
		title : document.getElementById('rule_editor_title').value,
		site_regexp : document.getElementById('rule_editor_site_regexp').value,
		example_url : document.getElementById('rule_editor_example_url').value,
		site_description : document.getElementById('rule_editor_site_description').value,
		search_block_xpath : document.getElementById('rule_editor_search_block_xpath').value,
		search_block_css : document.getElementById('rule_editor_search_block_css').value,
		search_block_description : document.getElementById('rule_editor_search_block_description').value,
		hide_block_xpath : document.getElementById('rule_editor_hide_block_xpath').value,
		hide_block_css : document.getElementById('rule_editor_hide_block_css').value,
		hide_block_description : document.getElementById('rule_editor_hide_block_description').value
	});
	if (validateErrors.length>0)
	{
		this.ruleEditorDialog.showMessage(validateErrors.join('<br/>'));
		return;
	}
	this.applyInput();
	this.bgCallback({command:'save', type:'rule', obj: this.rule});
	
};
RuleEditor.prototype.applyInput = function ()
{
	this.rule.title = document.getElementById('rule_editor_title').value;
	this.rule.site_regexp = document.getElementById('rule_editor_site_regexp').value;
	this.rule.example_url = document.getElementById('rule_editor_example_url').value;
	this.rule.site_description = document.getElementById('rule_editor_site_description').value;
	this.rule.search_block_xpath = document.getElementById('rule_editor_search_block_xpath').value;
	this.rule.search_block_css = document.getElementById('rule_editor_search_block_css').value;
	this.rule.search_block_by_css = document.getElementById('rule_editor_radio_search_css').checked;
	this.rule.search_block_description = document.getElementById('rule_editor_search_block_description').value;
	this.rule.hide_block_xpath = document.getElementById('rule_editor_hide_block_xpath').value;
	this.rule.hide_block_css = document.getElementById('rule_editor_hide_block_css').value;
	this.rule.hide_block_by_css = document.getElementById('rule_editor_radio_hide_css').checked;
	this.rule.hide_block_description = document.getElementById('rule_editor_hide_block_description').value;
	this.rule.block_anyway = document.getElementById('rule_editor_block_anyway').checked;
	
};
RuleEditor.prototype.addWord = function(wordStr)
{
	if (!wordStr || ''==wordStr) return; //Empty
	var word = new Word();
	
	word.word = wordStr;
	word.isNew = 'true';
	var checked = document.getElementById('rule_editor_keyword_regexp_checkbox').checked;
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

RuleEditor.prototype.getWordElement = function (word) 
{	
	var span = document.createElement('SPAN');
	
	span.className = 'word ' + ((word.is_regexp)?'regexp':'not_regexp');
	span.innerHTML = CustomBlockerUtil.escapeHTML(word.word);
	span.avoidStyle = true;
	
	var deleteButton = document.createElement('A');
	
	deleteButton.avoidStyle = true;
	deleteButton.className = 'deleteButton';
	deleteButton.href = 'javascript:void(0)'
	deleteButton.innerHTML = ' [x] '
	deleteButton.addEventListener('click', this.getWordDeleteAction(word, span), true);
	
	span.appendChild(deleteButton);
	
	return span;
};
RuleEditor.prototype.getWordDeleteAction = function (word, span) 
{
	var self = this;
	return function () 
	{
		span.parentNode.removeChild(span);
		word.deleted = true;
		word.dirty = true;
	};
};

function applyCss (path) 
{
	var cssNode = document.createElement('LINK');
	cssNode.rel = "stylesheet";
	cssNode.href = chrome.extension.getURL(path);
	document.getElementsByTagName('HEAD')[0].appendChild(cssNode);
}

/**
 * RuleEditorDialog
 */

var RuleEditorDialog = function(rule, src, _zIndex, ruleEditor) 
{
	this.ruleEditor = ruleEditor;
	this.div = document.createElement('DIV');
	this.div.id='rule_editor_container';
	
	with (this.div.style) 
	{
		zIndex = _zIndex;
		top = '10px';
		right = '10px';
	}
	document.body.appendChild(this.div);
	this.div.innerHTML = src;
	
	applyCss('/rule_editor.css');
	applyCss('/rule_editor_cursor.css');
	
	
	this.div.avoidStyle = true;
	
	{
		var nodes = this.div.getElementsByTagName('*');
		for (var i=0, l=nodes.length; i<l; i++) nodes[i].avoidStyle = true;
		
	}
	for (var i = 0, l = rule.words.length; i < l; i++) 
	{
		var word = rule.words[i];
		var span = ruleEditor.getWordElement(word)
		document.getElementById('rule_editor_keywords').appendChild(span);
	}

	if (rule.rule_id && rule.rule_id > 0) 
	{
		document.getElementById('rule_editor_title').value 
			= rule.title;
		document.getElementById('rule_editor_site_regexp').value 
			= rule.site_regexp;
		document.getElementById('rule_editor_example_url').value 
			= rule.example_url;
		document.getElementById('rule_editor_site_description').value 
			= rule.site_description;
		document.getElementById('rule_editor_search_block_xpath').value 
			= rule.search_block_xpath;
		document.getElementById('rule_editor_search_block_css').value 
			= rule.search_block_css;
		(document.getElementById('rule_editor_radio_search_'+((rule.search_block_by_css)?'css':'xpath'))).checked 
			= true;
		document.getElementById('rule_editor_search_block_description').value 
			= rule.search_block_description;
		document.getElementById('rule_editor_hide_block_xpath').value 
			= rule.hide_block_xpath;
		document.getElementById('rule_editor_hide_block_css').value 
			= rule.hide_block_css;
		(document.getElementById('rule_editor_radio_hide_'+((rule.hide_block_by_css)?'css':'xpath'))).checked 
			= true;
		document.getElementById('rule_editor_hide_block_description').value 
			= rule.hide_block_description;
		document.getElementById('rule_editor_block_anyway').checked = rule.block_anyway;
	}
	else 
	{
		
		document.getElementById('rule_editor_site_regexp').value = this.getSuggestedSiteRegexp();
		document.getElementById('rule_editor_site_description').value = document.title;
		document.getElementById('rule_editor_title').value = document.title;
		document.getElementById('rule_editor_example_url').value = location.href;
	}
	var dragger = document.getElementById('rule_editor_body_drag');
	dragger.addEventListener('mousedown', this.getOnMousedownAction(), false);
	document.body.addEventListener('mousemove', this.getOnMousemoveAction(), false);
	document.body.addEventListener('mouseup', this.getOnMouseupAction(), false);
	document.getElementById('rule_editor_closer').addEventListener('click', this.getCloseAction(), false);
	
	this.xpathPickerTarget = RuleEditorDialog.XPATH_PICKER_TARGET_NONE;
	var self = this;
	document.getElementById('rule_editor_button_search_block_xpath').addEventListener('click', 
		function()
		{
			self.xpathPickerTarget = RuleEditorDialog.XPATH_PICKER_TARGET_SEARCH
			}, false);
	document.getElementById('rule_editor_button_hide_block_xpath').addEventListener('click', 
		function(){
			self.xpathPickerTarget = RuleEditorDialog.XPATH_PICKER_TARGET_HIDE
		}, false);
	
	document.getElementById('rule_editor_save_button').addEventListener('click',
			function()
			{
				window.ruleEditor.save();
			}, 
		true);
	document.getElementById('rule_editor_keyword').addEventListener ('keydown',
		function(e)
		{
			if (KEY_CODE_RETURN==e.keyCode) 
			{
				window.ruleEditor.addWord(document.getElementById('rule_editor_keyword').value);
				document.getElementById('rule_editor_keyword').value = '';
			}
		}, 
		true);
	document.getElementById('rule_editor_add_keyword_button').addEventListener ('click',
		function()
		{
			window.ruleEditor.addWord(document.getElementById('rule_editor_keyword').value);
			document.getElementById('rule_editor_keyword').value = '';
		}, 
		true);
	document.getElementById('rule_editor_hide_block_xpath').addEventListener ('keyup',this.getRefreshHideBlockXPathAction(), false);
	document.getElementById('rule_editor_search_block_xpath').addEventListener ('keyup',this.getRefreshSearchBlockXPathAction(), false);
	document.getElementById('rule_editor_hide_block_xpath').addEventListener ('change',this.getRefreshHideBlockXPathAction(), false);
	document.getElementById('rule_editor_search_block_xpath').addEventListener ('change',this.getRefreshSearchBlockXPathAction(), false);
	document.getElementById('rule_editor_test_button').addEventListener('click', function () 
	{
		window.ruleEditor.applyInput();
		for (var i=0, l=hiddenNodes.length; i<l; i++)
		{
			hiddenNodes[i].style.display = 'block';
		}
		if (styleTag)
		{
			styleTag.parentNode.removeChild(styleTag);
		}
		applyRule(rule, true,
			function (node) 
			{
				addToHiddenNodes(node);
				node.style.backgroundColor = '#ccc';
			}, true
		);	
	}, false);
	document.getElementById('rule_editor_site_regexp').addEventListener ('keyup',function()
	{
		var matched = new RegExp(document.getElementById('rule_editor_site_regexp').value).test(location.href);
		document.getElementById('rule_editor_alert_site_regexp').style.display = (matched)?'none':'block';
	},
	false);
	var helpLinks = CustomBlockerUtil.getElementsByXPath('id("rule_editor_body")//a[@class="help"]');
	for (var i=0, l=helpLinks.length; i<l; i++) 
	{
		var link = helpLinks[i];
		link.addEventListener('click',CustomBlockerUtil.getShowHelpAction(link.href),false);
		link.href = 'javascript:void(0)';
	}
	document.getElementById('rule_editor_keyword_regexp_checkbox').addEventListener('click',RuleEditorDialog.changeKeywordColor, false);
	RuleEditorDialog.changeKeywordColor(null);
};
RuleEditorDialog.changeKeywordColor = function (sender)
{
	document.getElementById('rule_editor_keyword').style.backgroundColor =
		(document.getElementById('rule_editor_keyword_regexp_checkbox').checked)?'#fdd':'#def';
}
RuleEditorDialog.prototype.getRefreshHideBlockXPathAction = function ()
{
	var self = this;
	return function (event)
	{
		self.refreshXPathSelectedStyles();
		
	}
};
RuleEditorDialog.prototype.getRefreshSearchBlockXPathAction = function ()
{
	var self = this;
	return function (event)
	{
		self.refreshXPathSelectedStyles();
	}
};
RuleEditorDialog.prototype.refreshXPathSelectedStyles = function ()
{
	var searchAlertElement = document.getElementById('rule_editor_alert_search_block_xpath');
	var hideAlertElement = document.getElementById('rule_editor_alert_hide_block_xpath');
	var searchCountElement = document.getElementById('rule_editor_count_search_block_xpath');
	var hideCountElement = document.getElementById('rule_editor_count_hide_block_xpath');
	try {
		var input = document.getElementById('rule_editor_hide_block_xpath');
		var xpathNodes = (input.value!='')?CustomBlockerUtil.getElementsByXPath(input.value):[];
		hideCountElement.innerHTML = xpathNodes.length;
		hideAlertElement.style.display = 'none';
		if (this.prevHideXPathNodes)
		{
			for (var i=0, l=this.prevHideXPathNodes.length; i<l; i++) {
				if (this.prevHideXPathNodes[i].unselectForHide)
					this.prevHideXPathNodes[i].unselectForHide();
			}
		}
		for (var i=0, l=xpathNodes.length; i<l; i++)
		{
			if (xpathNodes[i].selectForHide)
				xpathNodes[i].selectForHide();
		}
		this.prevHideXPathNodes = xpathNodes;
	}
	catch (e)
	{
		//Invalid XPath
		hideAlertElement.style.display = 'block';
		hideCountElement.innerHTML = '-';
	}
	try {
		var input = document.getElementById('rule_editor_search_block_xpath');
		var xpathNodes = (input.value!='')?CustomBlockerUtil.getElementsByXPath(input.value):[];
		searchCountElement.innerHTML = xpathNodes.length;
		searchAlertElement.style.display = 'none';
		if (this.prevSearchXPathNodes)
		{
			for (var i=0, l=this.prevSearchXPathNodes.length; i<l; i++) {
				if (this.prevSearchXPathNodes[i].unselectForSearch)
					this.prevSearchXPathNodes[i].unselectForSearch();
			}
		}
		for (var i=0, l=xpathNodes.length; i<l; i++)
		{
			if (xpathNodes[i].selectForSearch)
				xpathNodes[i].selectForSearch();
		}
		this.prevSearchXPathNodes = xpathNodes;
	}
	catch (e)
	{
		//Invalid XPath
		searchAlertElement.style.display = 'block';
		searchCountElement.innerHTML = '-';
	}
	
};
RuleEditorDialog.prototype.showMessage = function (message)
{
	var div = document.getElementById('rule_editor_alert');
	div.style.display = 'block';
	div.innerHTML = message;
};
RuleEditorDialog.prototype.getCloseAction = function ()
{
	var self = this;
	return function (event)
	{
		//TODO
		location.reload();
		self.div.parentNode.removeChild(self.div);	
	}
	
};
RuleEditorDialog.prototype.getOnMousedownAction = function () 
{
	var self = this;
	return function (event) 
	{
		console.log("onmousedown.dragger")
		self.moving = true;
		self.origEventX = event.pageX;
		self.origEventY = event.pageY;
		self.origDivX = parseInt(self.div.style.right.replace('px',''));
		self.origDivY = parseInt(self.div.style.top.replace('px',''));
	}
};
RuleEditorDialog.prototype.getOnMousemoveAction = function ()
 {
	var self = this;
	return function (event) 
	{
		if (!self.moving) return;
		self.div.style.position = 'absolute';
		self.div.style.right = (self.origDivX-(event.pageX - self.origEventX)) + 'px';
		self.div.style.top = (self.origDivY+(event.pageY - self.origEventY)) + 'px';
		
	}
};
RuleEditorDialog.prototype.getOnMouseupAction = function () 
{
	var self = this;
	return function (event) 
	{
		self.moving = false;
	}
};
RuleEditorDialog.prototype.getSuggestedSiteRegexp = function () 
{
	var str = location.href.replace(new RegExp('http(s|)://'),'');
	var metaChars = new RegExp('[\\\\^\\.\\$\\*\\?\\|\\(\\)\\[\\]\\{\\}]','g');
	str = str.replace(metaChars, function (a,b){return '\\'+a});
	return str;
};
RuleEditorDialog.XPATH_PICKER_TARGET_NONE = 0;
RuleEditorDialog.XPATH_PICKER_TARGET_SEARCH = 1;
RuleEditorDialog.XPATH_PICKER_TARGET_HIDE = 2;
/**
 * PathPickerDialog
 */
var PathPickerDialog = function (_zIndex, ruleEditor) 
{
	this.ruleEditor = ruleEditor;
	console.log("PathPickerDialog.ruleEditor=" + ruleEditor);
	this.div = document.createElement('DIV');
	this.div.id = 'xpath_picker_body';
	this.div.avoidStyle = true;
	with (this.div.style) 
	{
		display = 'none';
		backgroundColor = 'white';
		zIndex = _zIndex;
		fontSize = 'small';
		textAlign = 'left';
		position = 'absolute';
		outline = 'solid 1px black';
		padding = '4px';
		color = 'black';
	}
	this.ul = document.createElement('UL');
	this.ul.avoidStyle = true;
	this.div.appendChild(this.ul);
	document.body.appendChild(this.div);
	this.currentSearchFilter = null;
	this.currentHideFilter = null;
	this.currentFilter = null;
};

PathPickerDialog.prototype.show = function (event, list, target) 
{
	this.ul.innerHTML = '';
	
	for (var i=0, l=list.length; i<l; i++) 
	{
		var li = document.createElement('LI');
		li.avoidStyle = true;
		var a = document.createElement('A');
		a.avoidStyle = true;
		a.href = 'javascript:void(0)';
		var span = document.createElement('SPAN');
		span.className = 'xpath';
		span.innerHTML = CustomBlockerUtil.escapeHTML(list[i].xpath); 
		var badge = document.createElement('SPAN');
		badge.className = 'badge';

		badge.innerHTML = list[i].elements.length;
		
		a.appendChild(badge);
		a.appendChild(span);
		
		a.addEventListener('click', this.getOnclickAction(list[i], target), false);
		a.addEventListener('mouseover', this.getOnmouseroverAction(list[i], target), false);
		li.appendChild(a);
		this.ul.appendChild(li);
	}
	
	this.div.style.display = 'block';
	
	var _left = event.clientX + document.body.scrollLeft;
	var _top = event.clientY + document.body.scrollTop;
	
	if (_left + this.div.clientWidth > document.body.scrollLeft + window.innerWidth)
	{
		_left = document.body.scrollLeft + window.innerWidth - this.div.cliehtWidth;
	}
	
	if (_top + this.div.clientHeight > document.body.scrollTop + window.innerHeight) 
	{
		_top = document.body.scrollTop + window.innerHeight - this.div.clientHeight;
	}
	
	this.div.style.left = _left + 'px';
	this.div.style.top = _top + 'px';
	
	var isTargetHide = (target == RuleEditorDialog.XPATH_PICKER_TARGET_HIDE);
	var currentFilter = (isTargetHide)?self.currentHideFilter:self.currentSearchFilter;
	if (this.currentFilter!=currentFilter) 
	{
		var elements = this.currentFilter.elements;
		for (var i=0, l=elements.length; i<l; i++) 
		{
			if (elements[i].tmpUnselect)
				elements[i].tmpUnselect();
		}
	}
};
PathPickerDialog.prototype.getOnmouseroverAction = function (filter, target) 
{
	var self = this;
	return function()
	{
		var isTargetHide = (target == RuleEditorDialog.XPATH_PICKER_TARGET_HIDE);
		var currentFilter = (isTargetHide)?self.currentHideFilter:self.currentSearchFilter;
		
		if (currentFilter) 
		{
			var elements = currentFilter.elements;
			for (var i=0, l=elements.length; i<l; i++) 
			{
				if (!elements[i].avoidStyle)
				elements[i].style.outline = '';
			}
		}
		try 
		{
			var xpathNodes = CustomBlockerUtil.getElementsByXPath(filter.xpath);
			for (var i = 0; i < xpathNodes.length; i++) 
			{
				if (xpathNodes[i] != selectedNode && !xpathNodes[i].avoidStyle && xpathNodes[i].tmpSelectForHide) 
				{
					if (isTargetHide) xpathNodes[i].tmpSelectForHide();
					else  xpathNodes[i].tmpSelectForSearch();
				}
			}
		} 
		catch (e) 
		{
			alert(e)
		}
		if (isTargetHide) self.currentHideFilter = filter;
		else self.currentSearchFilter = filter;
		self.currentFilter = filter;
	}
}
PathPickerDialog.prototype.getOnclickAction = function (filter, target) 
{
	var self = this;
	return function()
	{
		var isTargetHide = (target == RuleEditorDialog.XPATH_PICKER_TARGET_HIDE);
		var currentFilter = (isTargetHide)?self.currentHideFilter:self.currentHideFilter;
		
		if (isTargetHide) 
		{
			document.getElementById('rule_editor_hide_block_xpath').value = filter.xpath;
		}
		else 
		{
			document.getElementById('rule_editor_search_block_xpath').value = filter.xpath;
		}
		self.ruleEditor.ruleEditorDialog.refreshXPathSelectedStyles();
		
		if (isTargetHide) self.currentHideFilter = filter;
		else self.currentSearchFilter = filter;
		
		self.currentFilter = filter;
		self.div.style.display = 'none';
	}
}


var RuleElement = 
{
	
};

RuleElement.appendFunctions = function (element)
{
	element.originalStyle = element.style.outline;
	
	element.isFocusedForHide = false;
	element.isFocusedForSearch = false;
	element.isTmpSelectedForHide = false;
	element.isTmpSelectedForSearch = false;
	element.isFocusedForHide = false;
	element.isSelectedForHide = false;
	element.isSelectedForSearch = false;
	
	// mouseover & out
	element.focusForHide = RuleElement.getFocusForHideFunc(element);
	element.focusForSearch = RuleElement.getFocusForSearchFunc(element);
	element.unfocus = RuleElement.getUnfocusFunc(element);
	// select by XPath Picker
	element.tmpSelectForHide = RuleElement.getTmpSelectForHideFunc(element);
	element.tmpSelectForSearch = RuleElement.getTmpSelectForSearchFunc(element);
	element.tmpUnselect = RuleElement.getTmpUnselectFunc(element);
	// select by XPath Textbox
	element.selectForHide = RuleElement.getSelectForHideFunc(element);
	element.unselectForHide = RuleElement.getUnselectForHideFunc(element);
	element.selectForSearch = RuleElement.getSelectForSearchFunc(element);
	element.unselectForSearch = RuleElement.getUnselectForSearchFunc(element);
};
RuleElement.STYLE_FOCUS_FOR_HIDE = 'solid 2px red';
RuleElement.STYLE_FOCUS_FOR_SEARCH = 'solid 2px blue';
RuleElement.STYLE_TMP_SELECT_FOR_HIDE = 'dotted 2px red';
RuleElement.STYLE_TMP_SELECT_FOR_SEARCH = 'dotted 2px blue';
RuleElement.STYLE_SELECT_FOR_HIDE = 'solid 1px red';
RuleElement.STYLE_SELECT_FOR_SEARCH = 'solid 1px blue';
RuleElement.getFocusForHideFunc = function (element) 
{
	return function()
	{
		//TODO Save
		element.isFocusedForHide = true;
		element.style.outline = RuleElement.STYLE_FOCUS_FOR_HIDE;
	};
};
RuleElement.getFocusForSearchFunc = function (element) 
{
	return function()
	{
		//TODO Save
		element.isFocusedForHide = true;
		element.style.outline = RuleElement.STYLE_FOCUS_FOR_SEARCH;
	};
};
RuleElement.getUnfocusFunc = function (element) 
{
	return function()
	{
		element.isFocusedForHide = false;
		if (element.isSelectedForHide) 
			element.style.outline = RuleElement.STYLE_SELECT_FOR_HIDE;
		else if (element.isSelectedForSearch) 
			element.style.outline = RuleElement.STYLE_SELECT_FOR_SEARCH;
		selectedNode.style.outline = element.originalStyle;
	};
};

RuleElement.getTmpSelectForHideFunc = function (element) 
{
	return function()
	{
		element.isTmpSelectedForHide = true;
		element.style.outline = RuleElement.STYLE_TMP_SELECT_FOR_HIDE;
	};
};

RuleElement.getTmpSelectForSearchFunc = function (element) 
{
	return function()
	{
		element.isTmpSelectedForSearch = true;
		element.style.outline = RuleElement.STYLE_TMP_SELECT_FOR_SEARCH;
	};
}
RuleElement.getTmpUnselectFunc = function (element) 
{
	return function()
	{
		element.isTmpSelectedForHide = false;
		element.isTmpSelectedForSearch = false;
		if (element.isSelectedForHide) 
			element.style.outline = RuleElement.STYLE_SELECT_FOR_HIDE;
		else if (element.isSelectedForSearch) 
			element.style.outline = RuleElement.STYLE_SELECT_FOR_SEARCH;
		element.style.outline = element.originalStyle;
	};
};

RuleElement.getSelectForHideFunc = function (element) 
{
	return function()
	{
		element.isSelectedForHide = true;
		element.style.outline = RuleElement.STYLE_SELECT_FOR_HIDE;
	};
};
RuleElement.getSelectForSearchFunc = function (element) 
{
	return function()
	{
		element.isSelectedForSearch = true;
		element.style.outline = RuleElement.STYLE_SELECT_FOR_SEARCH;
	};
};
RuleElement.getUnselectForHideFunc = function (element) 
{
	return function()
	{
		element.isSelectedForHide = false;
		if (element.isSelectedForSearch) 
			element.style.outline = RuleElement.STYLE_SELECT_FOR_SEARCH;
		else
			element.style.outline = element.originalStyle;
	};
};
RuleElement.getUnselectForSearchFunc = function (element) 
{
	return function()
	{
		element.isSelectedForSearch = false;
		if (element.isSelectedForHide) 
			element.style.outline = RuleElement.STYLE_SELECT_FOR_HIDE;
		element.style.outline = element.originalStyle;
		
	};
};

/**
 * PathFilter
 * @param {Object} xpath
 */
var PathFilter = function (xpath) 
{
	this.xpath = xpath;
	this.elements = CustomBlockerUtil.getElementsByXPath(xpath);
}