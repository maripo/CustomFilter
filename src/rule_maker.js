var selectedNode = null;
var origStyle = null;
var origHref = null;

var KEY_CODE_RETURN = 13;
/**
 * RuleMaker
 */
var RuleMaker = function (rule, src) 
{
	this.rule = (rule)?rule:Rule.createInstance();
	this.src = src;
};
RuleMaker.prototype.initialize = function () 
{
	var nodes = document.body.getElementsByTagName('*');
	this.maxZIndex = RuleMaker.getMaxZIndex();
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
	this.ruleMakerDialog = new RuleMakerDialog(this.rule, this.src, this.maxZIndex + 1, this);
	this.ruleMakerDialog.refreshXPathSelectedStyles();
};

RuleMaker.prototype.getOnMouseoverAction = function (node) 
{
	var self = this;
	return function (event)
	{
		if (selectedNode ==null && self.ruleMakerDialog && self.ruleMakerDialog.xpathPickerTarget) 
		{
			selectedNode = node;
			origStyle = selectedNode.style.outline;
			origHref = selectedNode.href;
			selectedNode.href = 'javascript:void(0)'
			if (self.ruleMakerDialog.xpathPickerTarget == RuleMakerDialog.XPATH_PICKER_TARGET_NONE) 
			{
				selectedNode.unfocus();
			}
			else if (self.ruleMakerDialog.xpathPickerTarget == RuleMakerDialog.XPATH_PICKER_TARGET_SEARCH) 
			{
				selectedNode.focusForSearch();
			}
			else if (self.ruleMakerDialog.xpathPickerTarget == RuleMakerDialog.XPATH_PICKER_TARGET_HIDE) 
			{
				selectedNode.focusForHide();
			}
			return;
		}
        event.stopPropagation();
		event.preventDefault();
	}
};

RuleMaker.prototype.onSaveDone = function (rule)
{
	this.rule.rule_id = rule.rule_id;
	for (var i=0, l=this.rule.words.length; i<l; i++)
	{
		this.rule.words[i].word_id = rule.words[i].word_id;
	}
	this.ruleMakerDialog.showMessage("セーブしました");
}

RuleMaker.prototype.getOnClickAction = function (node) 
{
	var self = this;
	return function (event) 
	{
		if (self.ruleMakerDialog.xpathPickerTarget == RuleMakerDialog.XPATH_PICKER_TARGET_NONE)
			return;
		if (selectedNode ==node) 
		{
			var analyzer = new PathAnalyzer(node);
			var list = analyzer.createPathList();
			self.pathPickerDialog.show(event, list, self.ruleMakerDialog.xpathPickerTarget);
		}
        event.stopPropagation();
		event.preventDefault();
	}
};

RuleMaker.prototype.getOnMouseoutAction = function (node) 
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

RuleMaker.getMaxZIndex = function () 
{
	var max = 1;
	var elements = document.getElementsByTagName('*');
	for (var i=0, l=elements.length; i<l; i++) 
	{
		var element = elements[i];
		var style = window.getComputedStyle(element);
		if (style && style.zIndex && 'auto'!=style.zIndex && style.zIndex>max)
			max = style.zIndex;
	}
	return max;
};
RuleMaker.prototype.getSuggestedXPath = function (_node) 
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

RuleMaker.prototype.save = function () 
{
	var validateErrors = Rule.Validator.validate({
		title : document.getElementById('rule_maker_title').value,
		site_regexp : document.getElementById('rule_maker_site_regexp').value,
		example_url : document.getElementById('rule_maker_example_url').value,
		site_description : document.getElementById('rule_maker_site_description').value,
		search_block_xpath : document.getElementById('rule_maker_search_block_xpath').value,
		search_block_description : document.getElementById('rule_maker_search_block_description').value,
		hide_block_xpath : document.getElementById('rule_maker_hide_block_xpath').value,
		hide_block_description : document.getElementById('rule_maker_hide_block_description').value
	});
	if (validateErrors.length>0)
	{
		this.ruleMakerDialog.showMessage(validateErrors.join('<br/>'));
		return;
	}
	this.applyInput();
	this.bgCallback({command:'save', type:'rule', obj: this.rule});
	
};
RuleMaker.prototype.applyInput = function ()
{
	this.rule.title = document.getElementById('rule_maker_title').value;
	this.rule.site_regexp = document.getElementById('rule_maker_site_regexp').value;
	this.rule.example_url = document.getElementById('rule_maker_example_url').value;
	this.rule.site_description = document.getElementById('rule_maker_site_description').value;
	this.rule.search_block_xpath = document.getElementById('rule_maker_search_block_xpath').value;
	this.rule.search_block_description = document.getElementById('rule_maker_search_block_description').value;
	this.rule.hide_block_xpath = document.getElementById('rule_maker_hide_block_xpath').value;
	this.rule.hide_block_description = document.getElementById('rule_maker_hide_block_description').value;
	this.rule.block_anyway = document.getElementById('rule_maker_block_anyway').checked;
	
	
};
RuleMaker.prototype.addWord = function(wordStr)
{
	if (!wordStr || ''==wordStr) return; //Empty
	var word = new Word();
	
	word.word = wordStr;
	word.isNew = 'true';
	var checked = document.getElementById('rule_maker_keyword_regexp_checkbox').checked;
	word.is_regexp = checked;
	
	word.dirty = true;
	
	var span = this.getWordElement(word)
	document.getElementById('rule_maker_keywords').appendChild(span);
	
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

RuleMaker.prototype.getWordElement = function (word) 
{	
	var span = document.createElement('SPAN');
	
	span.className = 'word ' + ((word.is_regexp)?'regexp':'not_regexp');
	span.innerHTML = Util.escapeHTML(word.word);
	span.avoidStyle = true;
	
	var deleteButton = document.createElement('A');
	
	deleteButton.avoidStyle = true;
	deleteButton.className = 'deleteButton';
	deleteButton.href = 'javascript:void(0)'
	deleteButton.innerHTML = '[x]'
	deleteButton.addEventListener('click', this.getWordDeleteAction(word, span), true);
	
	span.appendChild(deleteButton);
	
	return span;
};
RuleMaker.prototype.getWordDeleteAction = function (word, span) 
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
 * RuleMakerDialog
 */

var RuleMakerDialog = function(rule, src, _zIndex, ruleMaker) 
{
	this.ruleMaker = ruleMaker;
	this.div = document.createElement('DIV');
	this.div.id='rule_maker_container';
	
	with (this.div.style) 
	{
		zIndex = _zIndex;
		top = '10px';
		right = '10px';
	}
	document.body.appendChild(this.div);
	this.div.innerHTML = src;
	
	applyCss('/rule_maker.css');
	applyCss('/rule_maker_cursor.css');
	
	
	this.div.avoidStyle = true;
	
	{
		var nodes = this.div.getElementsByTagName('*');
		for (var i=0, l=nodes.length; i<l; i++) nodes[i].avoidStyle = true;
		
	}
	for (var i = 0, l = rule.words.length; i < l; i++) 
	{
		var word = rule.words[i];
		var span = ruleMaker.getWordElement(word)
		document.getElementById('rule_maker_keywords').appendChild(span);
	}

	if (rule.rule_id && rule.rule_id > 0) 
	{
		document.getElementById('rule_maker_title').value 
			= rule.title;
		document.getElementById('rule_maker_site_regexp').value 
			= rule.site_regexp;
		document.getElementById('rule_maker_example_url').value 
			= rule.example_url;
		document.getElementById('rule_maker_site_description').value 
			= rule.site_description;
		document.getElementById('rule_maker_search_block_xpath').value 
			= rule.search_block_xpath;
		document.getElementById('rule_maker_search_block_description').value 
			= rule.search_block_description;
		document.getElementById('rule_maker_hide_block_xpath').value 
			= rule.hide_block_xpath;
		document.getElementById('rule_maker_hide_block_description').value 
			= rule.hide_block_description;
		document.getElementById('rule_maker_block_anyway').checked = rule.block_anyway;
	}
	else 
	{
		
		document.getElementById('rule_maker_site_regexp').value = this.getSuggestedSiteRegexp();
		document.getElementById('rule_maker_site_description').value = document.title;
		document.getElementById('rule_maker_title').value = document.title;
		document.getElementById('rule_maker_example_url').value = location.href;
	}
	
	var dragger = document.getElementById('rule_maker_body_drag');
	dragger.addEventListener('mousedown', this.getOnMousedownAction(), false);
	document.body.addEventListener('mousemove', this.getOnMousemoveAction(), false);
	document.body.addEventListener('mouseup', this.getOnMouseupAction(), false);
	document.getElementById('rule_maker_closer').addEventListener('click', this.getCloseAction(), false);
	
	this.xpathPickerTarget = RuleMakerDialog.XPATH_PICKER_TARGET_NONE;
	var self = this;
	document.getElementById('rule_maker_button_search_block_xpath').addEventListener('click', 
		function()
		{
			self.xpathPickerTarget = RuleMakerDialog.XPATH_PICKER_TARGET_SEARCH
			}, false);
	document.getElementById('rule_maker_button_hide_block_xpath').addEventListener('click', 
		function(){
			self.xpathPickerTarget = RuleMakerDialog.XPATH_PICKER_TARGET_HIDE
		}, false);
	
	document.getElementById('rule_maker_save_button').addEventListener('click',
			function()
			{
				window.ruleMaker.save();
			}, 
		true);
	document.getElementById('rule_maker_keyword').addEventListener ('keydown',
		function(e)
		{
			if (KEY_CODE_RETURN==e.keyCode) 
			{
				window.ruleMaker.addWord(document.getElementById('rule_maker_keyword').value);
				document.getElementById('rule_maker_keyword').value = '';
			}
		}, 
		true);
	document.getElementById('rule_maker_add_keyword_button').addEventListener ('click',
		function()
		{
			window.ruleMaker.addWord(document.getElementById('rule_maker_keyword').value);
			document.getElementById('rule_maker_keyword').value = '';
		}, 
		true);
	document.getElementById('rule_maker_hide_block_xpath').addEventListener ('keyup',this.getRefreshHideBlockXPathAction(), false);
	document.getElementById('rule_maker_search_block_xpath').addEventListener ('keyup',this.getRefreshSearchBlockXPathAction(), false);
	document.getElementById('rule_maker_hide_block_xpath').addEventListener ('change',this.getRefreshHideBlockXPathAction(), false);
	document.getElementById('rule_maker_search_block_xpath').addEventListener ('change',this.getRefreshSearchBlockXPathAction(), false);
	document.getElementById('rule_maker_title').focus();
	document.getElementById('rule_maker_test_button').addEventListener('click', function () 
	{
		window.ruleMaker.applyInput();
		for (var i=0, l=hiddenNodes.length; i<l; i++)
		{
			hiddenNodes[i].style.display = 'block';
		}
		applyRule(rule, true,
			function (node) 
			{
				addToHiddenNodes(node);
				node.style.backgroundColor = '#ccc';
			}
		);	
	}, false);
	document.getElementById('rule_maker_site_regexp').addEventListener ('keyup',function()
	{
		var matched = new RegExp(document.getElementById('rule_maker_site_regexp').value).test(location.href);
		console.log("PUNI " + matched);
		document.getElementById('rule_maker_alert_site_regexp').style.display = (matched)?'none':'block';
	},
	false);
};
RuleMakerDialog.prototype.getRefreshHideBlockXPathAction = function ()
{
	var self = this;
	return function (event)
	{
		self.refreshXPathSelectedStyles();
		
	}
};
RuleMakerDialog.prototype.getRefreshSearchBlockXPathAction = function ()
{
	var self = this;
	return function (event)
	{
		self.refreshXPathSelectedStyles();
	}
};
RuleMakerDialog.prototype.refreshXPathSelectedStyles = function ()
{
	try {
		var xpathNodes = Util.getElementsByXPath(document.getElementById('rule_maker_hide_block_xpath').value);
		if (this.prevHideXPathNodes)
		{
			for (var i=0, l=this.prevHideXPathNodes.length; i<l; i++) {
				this.prevHideXPathNodes[i].unselectForHide();
			}
		}
		for (var i=0, l=xpathNodes.length; i<l; i++)
		{
			xpathNodes[i].selectForHide();
		}
		this.prevHideXPathNodes = xpathNodes;
	}
	catch (e)
	{
		console.log("TODO RuleMakerDialog.prototype.refreshHideBlockXPath ERROR "+ e);
	}
	try {
		var xpathNodes = Util.getElementsByXPath(document.getElementById('rule_maker_search_block_xpath').value);
		if (this.prevSearchXPathNodes)
		{
			for (var i=0, l=this.prevSearchXPathNodes.length; i<l; i++) {
				this.prevSearchXPathNodes[i].unselectForSearch();
			}
		}
		for (var i=0, l=xpathNodes.length; i<l; i++)
		{
			xpathNodes[i].selectForSearch();
		}
		this.prevSearchXPathNodes = xpathNodes;
	}
	catch (e)
	{
		console.log("TODO RuleMakerDialog.prototype.refreshHideBlockXPath ERROR "+ e);
	}
	
};
RuleMakerDialog.prototype.showMessage = function (message)
{
	var div = document.getElementById('rule_maker_alert');
	div.style.display = 'block';
	div.innerHTML = message;
};
RuleMakerDialog.prototype.getCloseAction = function ()
{
	var self = this;
	return function (event)
	{
		//TODO
		location.reload();
		self.div.parentNode.removeChild(self.div);	
	}
	
};
RuleMakerDialog.prototype.getOnMousedownAction = function () 
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
RuleMakerDialog.prototype.getOnMousemoveAction = function ()
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
RuleMakerDialog.prototype.getOnMouseupAction = function () 
{
	var self = this;
	return function (event) 
	{
		self.moving = false;
	}
};
RuleMakerDialog.prototype.getSuggestedSiteRegexp = function () 
{
	var str = location.href.replace(new RegExp('http(s|)://'),'');
	var metaChars = new RegExp('[\\\\^\\.\\$\\*\\?\\|\\(\\)\\[\\]\\{\\}]','g');
	str = str.replace(metaChars, function (a,b){return '\\'+a});
	return str;
};
RuleMakerDialog.XPATH_PICKER_TARGET_NONE = 0;
RuleMakerDialog.XPATH_PICKER_TARGET_SEARCH = 1;
RuleMakerDialog.XPATH_PICKER_TARGET_HIDE = 2;
/**
 * PathPickerDialog
 */
var PathPickerDialog = function (_zIndex, ruleMaker) 
{
	this.ruleMaker = ruleMaker;
	console.log("PathPickerDialog.ruleMaker=" + ruleMaker);
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
		span.innerHTML = Util.escapeHTML(list[i].xpath); 
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
	
	var isTargetHide = (target == RuleMakerDialog.XPATH_PICKER_TARGET_HIDE);
	var currentFilter = (isTargetHide)?self.currentHideFilter:self.currentSearchFilter;
	if (this.currentFilter!=currentFilter) 
	{
		var elements = this.currentFilter.elements;
		for (var i=0, l=elements.length; i<l; i++) 
		{
			elements[i].tmpUnselect();
		}
	}
};
PathPickerDialog.prototype.getOnmouseroverAction = function (filter, target) 
{
	var self = this;
	return function()
	{
		var isTargetHide = (target == RuleMakerDialog.XPATH_PICKER_TARGET_HIDE);
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
			var xpathNodes = Util.getElementsByXPath(filter.xpath);
			for (var i = 0; i < xpathNodes.length; i++) 
			{
				if (xpathNodes[i] != selectedNode && !xpathNodes[i].avoidStyle) 
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
		var isTargetHide = (target == RuleMakerDialog.XPATH_PICKER_TARGET_HIDE);
		var currentFilter = (isTargetHide)?self.currentHideFilter:self.currentHideFilter;
		
		if (isTargetHide) 
		{
			document.getElementById('rule_maker_hide_block_xpath').value = filter.xpath;
		}
		else 
		{
			document.getElementById('rule_maker_search_block_xpath').value = filter.xpath;
		}
		self.ruleMaker.ruleMakerDialog.refreshXPathSelectedStyles();
		
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
		//TODO 保存
		element.isFocusedForHide = true;
		element.style.outline = RuleElement.STYLE_FOCUS_FOR_HIDE;
	};
};
RuleElement.getFocusForSearchFunc = function (element) 
{
	return function()
	{
		//TODO 保存
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
