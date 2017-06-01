var selectedNode = null;
var origStyle = null;
var origHref = null;

/**
 * RuleEditor
 */
var RuleEditor = function () 
{
};
RuleEditor.prototype.initialize = function (rule, appliedRuleList) 
{
	this.pathPickerEventHandlers = new Array();
	this.rule = (rule)?rule:Rule.createInstance(location.href, document.title);
	this.appliedRuleList = appliedRuleList;
	
	var nodes = document.body.getElementsByTagName('*');
	this.maxZIndex = RuleEditor.getMaxZIndex();
	RuleExecutor.stopBlocking();
	
	// For path picker
	for (var i=0; i<nodes.length; i++) {		
		var node = nodes[i];
		if (node.avoidStyle) {
			continue;
		}
		var mouseoverHandler = this.getOnMouseoverActionForFrame(node);
		var mouseoutHandler = this.getOnMouseoutActionForFrame(node);
		var clickHandler = this.getOnClickActionForFrame(node);
		node.addEventListener('mouseover', mouseoverHandler, false);
		node.addEventListener('mouseout', mouseoutHandler, false);
		node.addEventListener('click', clickHandler, false);
		this.pathPickerEventHandlers.push(
			{
				node:node,
				mouseoverHandler:mouseoverHandler, 
				mouseoutHandler:mouseoutHandler,
				clickHandler:clickHandler
			}
		);
		RuleElement.appendFunctions(node);
	}
	CustomBlockerUtil.applyCss('/css/reset.css');
	CustomBlockerUtil.applyCss('/css/rule_editor.css');
	CustomBlockerUtil.applyCss('/css/rule_editor_common.css');
	CustomBlockerUtil.applyCss('/css/keywords.css');
	CustomBlockerUtil.applyCss('/css/rule_editor_cursor.css');	
	
	if (!this.pathPickerDialog) {
		this.pathPickerDialog = new PathPickerDialog(this.maxZIndex + 2, this);
	}
	CustomBlockerUtil.enableFlashZIndex();
	this.openFrame();
};
RuleEditor.prototype.hideCover = function () {
	window.elementHighlighter.highlightHideElements (null);
}
RuleEditor.prototype.removePathPickerEventHandlers = function () {
	if (!this.pathPickerEventHandlers) return;
	for (var i=0; i<this.pathPickerEventHandlers.length; i++) {
		var obj = this.pathPickerEventHandlers[i];
		obj.node.removeEventListener('mouseover', obj.mouseoverHandler);
		obj.node.removeEventListener('mouseout', obj.mouseoutHandler);
		obj.node.removeEventListener('click', obj.clickHandler);
	}
};
RuleEditor.prototype.pickPath = function (data) {
	window.elementHighlighter.highlightHideElements (null);
	this.hideCover();

	//search_xpath, search_css, hide_xpath, hide_css
	switch (data.target) {
	case "search_xpath":
		this.pathPickerTarget = PathPickerDialog.targetSearchXpath; break;
	case "search_css":
		this.pathPickerTarget = PathPickerDialog.targetSearchCss; break;
	case "hide_xpath":
		this.pathPickerTarget = PathPickerDialog.targetHideXpath; break;
	case "hide_css":
		this.pathPickerTarget = PathPickerDialog.targetHideCss; break;
	}
	this.pathPickerTarget.label = data.target;
}
RuleEditor.prototype.sendRuleToFrame = function () {
	this.iframe.contentWindow.postMessage(
			{
				command:'customblocker_set_rule',
				url:location.href,
				title:document.title,
				rule:this.rule},
			"*");
};
RuleEditor.prototype.handleReceivedMessage = function (data) {
	switch (data.command) {
	case "customblocker_frame_ready": {
		this.sendRuleToFrame();
		break;
	}
	case "customblocker_save_rule": {
		window.bgProcessor.sendRequest('db', {dbCommand:'save', type:'rule', obj: data.rule}, 'ruleSaveDoneRuleEditor');
		break;
	}
	case "customblocker_test_rule": {
		var rule = data.rule;
		hiddenNodeList.restoreStyles();
		if (RuleExecutor.styleTag) {
			RuleExecutor.styleTag.parentNode.removeChild(RuleExecutor.styleTag);
		}
		RuleExecutor.applyRule(rule, true,
			function (node) {
			testNodeList.add(node);
			testNodeList.apply(node);
			}, true);
		break;
	}
	case "customblocker_pick_path": {
		this.pickPath(data);
		break;
	}
	case "customblocker_validate_selectors": {
		this.validateSelectors(data);
		break;
	}
	case "customblocker_close": {
		this.closeFrame();
		break;
	}
	case "customblocker_resize": {
		this.iframe.style.height = data.height + "px";
		break;
	}
	}
};
RuleEditor.prototype.closeFrame = function () {
	this.frameContainer.style.display = 'none';
	/*
	 * TODO
	if (self.rule.changed)
	{
		if (!window.confirm(chrome.i18n.getMessage('unsavedDialog')))
			return;
	}
	*/
	this.pathPickerDialog.close();
	this.pathPickerDialog.deselectAllTargets();
	this.removePathPickerEventHandlers();
	window.elementHighlighter.highlightRule(null);
	CustomBlockerUtil.removeCss('/css/rule_editor_cursor.css');
	testNodeList.restoreStyles();
	hiddenNodeList.applyStyles();
	RuleExecutor.reloadRules();
};
RuleEditor.prototype.validateSelector = function (selectorType, isSearch, selector) {
	try {
		var pathNodes;
		if (selectorType=="css") {
			pathNodes = (selector!='')? CustomBlockerUtil.getElementsByCssSelector(selector):[];
		}
		else {
			pathNodes = (selector!='')? CustomBlockerUtil.getElementsByXPath(selector):[];
		}
		return {isValid:true, nodes:pathNodes};
	} catch (e) {
		console.log(e);
		return {valid:false, nodes:[]};
	}
}
RuleEditor.prototype.validateSelectors = function (data) {
	var hideResult = this.validateSelector(data.hide_type, false, data.hide_selector);
	if (hideResult.isValid) {
		window.elementHighlighter.highlightHideElements(hideResult.nodes);
	}
	var searchResult = this.validateSelector(data.search_type, false, data.search_selector);
	if (searchResult.isValid) {
		window.elementHighlighter.highlightSearchElements(searchResult.nodes);
	}
	var options = {command:'customblocker_validate_selectors_result',
			hideType: data.hide_type,
			hideValid: hideResult.isValid,
			hideCount: hideResult.nodes.length, 
			searchType: data.search_type,
			searchValid: searchResult.isValid,
			searchCount: searchResult.nodes.length
			};
	this.iframe.contentWindow.postMessage(options, "*");
};
RuleEditor.prototype.getReceiveMessageFunc = function () {
	var self = this;
	return function (event) {
		if (!(event.origin.indexOf(chrome.runtime.id)>=0)) {
			return;
		}
		self.handleReceivedMessage(event.data);
	}
};

// Drag rule editor dialog (with top bar)
RuleEditor.prototype.getOnMousedownAction = function () 
{
	var self = this;
	return function (event) 
	{
		self.moving = true;
		self.origEventX = event.pageX;
		self.origEventY = event.pageY;
		self.origDivX = parseInt(self.frameContainer.style.right.replace('px',''));
		self.origDivY = parseInt(self.frameContainer.style.top.replace('px',''));
	}
};
RuleEditor.prototype.getOnMousemoveAction = function ()
 {
	var self = this;
	return function (event) 
	{
		if (!self.moving) return;
		//self.frameContainer.style.position = 'absolute';
		self.frameContainer.style.right = (self.origDivX-(event.pageX - self.origEventX)) + 'px';
		self.frameContainer.style.top = (self.origDivY+(event.pageY - self.origEventY)) + 'px';
		
	}
};
RuleEditor.prototype.getOnMouseupAction = function () {
	var self = this;
	return function (event) 
	{
		if (self.moving)
			self.moving = false;
		else
		{
			self.processSelection(event);
		}
	}
};
// ?
RuleEditor.prototype.processSelection = function (event) {
	if (null==document.getSelection()) 
		return;
	if (document.getElementById('rule_editor_keyword') == event.srcElement)
		return;
};

RuleEditor.prototype.openFrame = function () {
	if (this.frameContainer) {
		// Existing and hidden. Send rule immediately.
		this.frameContainer.style.display = "block";
		this.sendRuleToFrame();
		return;
	}
	// Create and show new frame (div > [div.dragger, iframe])
	var frameContainer = document.createElement("DIV");
	with (frameContainer.style) {
		position = "fixed";
		zIndex = this.maxZIndex + 1;
		width = '400px';
		top = '10px';
		right = '10px';
		backgroundColor = '#fff';
		border = '1px solid #888';
		boxShadow = "0px 1px 1px rgba(0,0,0,0.5)";
	}
	var iframe = document.createElement("IFRAME");
	iframe.src = chrome.extension.getURL('/rule_editor_frame_'+ chrome.i18n.getMessage('extLocale') + '.html');
	iframe.scrolling = "no";
	iframe.frameborder = "0";
	with (iframe.style) {
		width = '400px';
		height = '640px'; // TODO resize height
		border = 'none';
	}
	var dragger = document.createElement("DIV");
	dragger.addEventListener('mousedown', this.getOnMousedownAction(), false);
	document.body.addEventListener('mousemove', this.getOnMousemoveAction(), false);
	document.body.addEventListener('mouseup', this.getOnMouseupAction(), false);
	
	with (dragger.style) {
		backgroundColor = "#fff";
		height = "18px";
		width = "100%";
		display = "block";
		textAlign = "right";
		cursor = "move";
	}
	
	var scope = this;
	var closeIcon = document.createElement("A");
	with (closeIcon.style) {
		backgroundImage = "url(" + chrome.extension.getURL("/img/rule_editor_close.png") + ")";
		backgroundRepeat = "no-repeat";
		backgroundPosition = "2px 2px";
		backgroundSize = "14px 14px";
		display = "block";
		width = "22px";
		height = "18px";
		marginTop = "4px";
		float = "right";
	}
	closeIcon.href = "javascript:void(0)";
	closeIcon.addEventListener("click",function(){scope.closeFrame()}, false);
	dragger.appendChild(closeIcon);
	
	dragger.avoidStyle = true;
	frameContainer.avoidStyle = true;
	iframe.avoidStyle = true;
	closeIcon.avoidStyle = true;
	
	frameContainer.appendChild(dragger);
	frameContainer.appendChild(iframe);
	document.body.appendChild(frameContainer);
	this.iframe = iframe;
	this.frameContainer = frameContainer;
	// Add listener and wait for ready message
	window.addEventListener("message", this.getReceiveMessageFunc(), false);
};

RuleEditor.prototype.onSaveDone = function (rule)
{
	this.rule.rule_id = rule.rule_id;
	for (var i=0, l=this.rule.words.length; i<l; i++)
	{
		this.rule.words[i].word_id = rule.words[i].word_id;
	}
	var options = {command:'customblocker_rule_saved',
			rule:rule
			};
	this.iframe.contentWindow.postMessage(options, "*");
};
/* Event handlers for path picker */
RuleEditor.prototype.getOnClickActionForFrame = function (node) {
	var self = this;
	return function (event) {
		self.openPathPicker(event, node);
	}
};
RuleEditor.prototype.openPathPicker = function (event, node) {
	if (!window.ruleEditor || !this.pathPickerTarget || this.pathPickerTarget.none) {
		return;
	}
	var scope = this;
	if (selectedNode == node) {
		var analyzer = new PathAnalyzer(node, this.pathPickerTarget.getPathBuilder());
		var paths = analyzer.createPathList();
		this.pathPickerDialog.show(event, node, paths, this.pathPickerTarget, 
			function (e) {
				scope.unfocusNode(node);
				console.log(node.parentNode)
				scope.focusNode(node.parentNode);
				scope.openPathPicker(event, node.parentNode);
			},
			function (target, path) {
				var options = {
					command: "customblocker_path_picked",
					target: target,
					path: path
				};
				scope.iframe.contentWindow.postMessage(options, "*");
			});
	}
	event.stopPropagation();
	event.preventDefault();
};
RuleEditor.prototype.focusNode = function (node) {
	var self = this;
	selectedNode = node;
	origStyle = selectedNode.style.outline;
	origHref = selectedNode.href;
	selectedNode.href = 'javascript:void(0)'
	if (self.pathPickerTarget.none && selectedNode.unfocus) {
		selectedNode.unfocus();
	}
	else if (self.pathPickerTarget.isToHide && selectedNode.focusForSearch) {
		selectedNode.focusForHide();
	}
	else if (self.pathPickerTarget.isToSearch && selectedNode.focusForHide) {
		selectedNode.focusForSearch();
	}
};
RuleEditor.prototype.getOnMouseoverActionForFrame = function (node) {
	var self = this;
	return function (event) {
		if (window.ruleEditor && selectedNode == null && self.pathPickerTarget) {
			self.focusNode(node);
		}
		event.stopPropagation();
		event.preventDefault();
	}
};

RuleEditor.prototype.unfocusNode = function (node) {

	if (window.ruleEditor && selectedNode) {
		selectedNode.style.outline = origStyle;
		selectedNode.href = origHref;
	}
	selectedNode = null;	
}
RuleEditor.prototype.getOnMouseoutActionForFrame = function (node) {
	var scope = this;
	return function (event) {
		scope.unfocusNode(node);
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

/**
 * PathPickerDialog
 */
var PathPickerDialog = function (_zIndex, ruleEditor) 
{
	this.ruleEditor = ruleEditor;
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
		padding = '4px';
		color = 'black';
	}
	this.ul = document.createElement('UL');
	this.ul.avoidStyle = true;
	this.div.appendChild(this.ul);
	document.body.appendChild(this.div);
	// No filter selected
	this.currentSearchFilter = null;
	this.currentHideFilter = null;
	this.currentFilter = null;
};

PathPickerDialog.prototype.show = function (event, originNode, paths, 
		/* PathPickerDialog.target... */target, onSelectUpperNode, onSelect) {
	console.log("originNode=")
	console.log(originNode)
	this.ul.innerHTML = '';
	if (originNode.parentNode && originNode.parentNode!=document.body) {
		var li = document.createElement('LI');
		li.innerHTML = "Upper Element";
		li.addEventListener('click', onSelectUpperNode, false);
		this.ul.appendChild(li);
	}
	
	for (var i=0, l=paths.length; i<l; i++) {
		var li = document.createElement('LI');
		li.avoidStyle = true;
		
		var a = document.createElement('A');
		a.avoidStyle = true;
		a.href = 'javascript:void(0)';
		
		var span = document.createElement('SPAN');
		span.className = 'xpath';
		span.innerHTML = CustomBlockerUtil.escapeHTML(CustomBlockerUtil.trim(paths[i].path));
		
		var badge = document.createElement('SPAN');
		badge.className = 'badge';
		badge.innerHTML = paths[i].elements.length;
		
		a.appendChild(badge);
		a.appendChild(span);
		
		a.addEventListener('click', this.getOnclickAction(paths[i], target, onSelect), false);
		a.addEventListener('mouseover', this.getOnmouseoverAction(paths[i], target), false);
		li.appendChild(a);
		this.ul.appendChild(li);
	}
	
	this.div.style.display = 'block';
	
	var _left = event.clientX + document.body.scrollLeft;
	var _top = event.clientY + document.body.scrollTop;
	
	if (_left + this.div.clientWidth > document.body.scrollLeft + window.innerWidth) {
		_left = document.body.scrollLeft + window.innerWidth - this.div.cliehtWidth;
	}
	
	if (_top + this.div.clientHeight > document.body.scrollTop + window.innerHeight)  {
		_top = document.body.scrollTop + window.innerHeight - this.div.clientHeight;
	}
	
	this.div.style.left = _left + 'px';
	this.div.style.top = _top + 'px';

	var currentFilter = (target.isToHide)?self.currentHideFilter:self.currentSearchFilter;
	if (this.currentFilter!=currentFilter) {
		var elements = this.currentFilter.elements;
		for (var i=0, l=elements.length; i<l; i++) {
			if (elements[i].tmpUnselect)
				elements[i].tmpUnselect();
		}
	}
};

//Remove outline from selecor's target
PathPickerDialog.prototype.deselectFilterTargets = function (filter) {
	if (!filter) return;
	var elements = filter.elements;
	for (var i=0, l=elements.length; i<l; i++) {
		if (!elements[i].avoidStyle) {
			elements[i].style.outline = '';
		}
	}
	
};
PathPickerDialog.prototype.deselectAllTargets = function (filter) {
	this.deselectFilterTargets(this.currentHideFilter);
	this.deselectFilterTargets(this.currentSearchFilter);
};
PathPickerDialog.prototype.getOnmouseoverAction = function (filter, 
		/*PathPickerDialog.target...*/target) {
	var self = this;
	return function() {
		var currentFilter = (target.isToHide)? self.currentHideFilter:self.currentSearchFilter;
		if (currentFilter) {
			self.deselectFilterTargets(currentFilter);
		}
		try {
			var pathNodes = target.getPathNodes(filter.path);
			for (var i = 0; i < pathNodes.length; i++) {
				if (pathNodes[i] != selectedNode && !pathNodes[i].avoidStyle && pathNodes[i].tmpSelectForHide) {
					if (target.isToHide) pathNodes[i].tmpSelectForHide();
					else  pathNodes[i].tmpSelectForSearch();
				}
			}
		} 
		catch (e) {
			console.log(e)
		}
		if (target.isToHide) self.currentHideFilter = filter;
		else self.currentSearchFilter = filter;
		self.currentFilter = filter;
	}
}
PathPickerDialog.prototype.close = function () {
	if (this.div) {
		this.div.style.display = 'none';
	}
};
PathPickerDialog.prototype.getOnclickAction = function (filter, /*PathPickerDialog.target...*/target, onSelect) 
{
	var self = this;
	return function()
	{
		var currentFilter = (target.isToHide)? self.currentHideFilter:self.currentHideFilter;
		var path = CustomBlockerUtil.trim(filter.path);

		if (onSelect) {
			onSelect(target.label, path);
		}
		
		if (target.isToHide) self.currentHideFilter = filter;
		else self.currentSearchFilter = filter;
		
		self.currentFilter = filter;
		self.close();
	}
};

var RuleElement = 
{
	
};

RuleElement.appendFunctions = function (element)
{
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
};

RuleElement.getFocusForHideFunc = function (element) 
{
	return function()
	{
		// Save
		element.isFocusedForHide = true;
		element.style.outline = ElementHighlighter.STYLE_FOCUS_FOR_HIDE;
	};
};
RuleElement.getFocusForSearchFunc = function (element) 
{
	return function()
	{
		// Save
		if (null==element.originalStyle)
			element.originalStyle = (null!=element.style.outline)?element.style.outline:"";
		element.isFocusedForHide = true;
		element.style.outline = ElementHighlighter.STYLE_FOCUS_FOR_SEARCH;
	};
};
RuleElement.getUnfocusFunc = function (element) 
{
	return function()
	{
		element.isFocusedForHide = false;
		if (element.isSelectedForHide) 
			element.style.outline = ElementHighlighter.STYLE_SELECT_FOR_HIDE;
		else if (element.isSelectedForSearch) 
			element.style.outline = ElementHighlighter.STYLE_SELECT_FOR_SEARCH;
		selectedNode.style.outline = element.originalStyle;
	};
};

RuleElement.getTmpSelectForHideFunc = function (element) 
{
	return function()
	{
		if (null==element.originalStyle)
			element.originalStyle = (null!=element.style.outline)?element.style.outline:"";
		element.isTmpSelectedForHide = true;
		element.style.outline = ElementHighlighter.STYLE_TMP_SELECT_FOR_HIDE;
	};
};

RuleElement.getTmpSelectForSearchFunc = function (element) 
{
	return function()
	{
		if (null==element.originalStyle)
			element.originalStyle = (null!=element.style.outline)?element.style.outline:"";
		element.isTmpSelectedForSearch = true;
		element.style.outline = ElementHighlighter.STYLE_TMP_SELECT_FOR_SEARCH;
	};
}
RuleElement.getTmpUnselectFunc = function (element) 
{
	return function()
	{
		element.isTmpSelectedForHide = false;
		element.isTmpSelectedForSearch = false;
		if (element.isSelectedForHide) 
			element.style.outline = ElementHighlighter.STYLE_SELECT_FOR_HIDE;
		else if (element.isSelectedForSearch) 
			element.style.outline = ElementHighlighter.STYLE_SELECT_FOR_SEARCH;
		element.style.outline = element.originalStyle;
	};
};

PathPickerDialog.targetNone = {
		none: true,
		isToHide: false,
		isToSearch: false,
		textboxId: 'rule_editor_hide_block_xpath'
};
PathPickerDialog.targetHideXpath = {
		none: false,
		isToHide: true,
		isToSearch: false,
		textboxId: 'rule_editor_hide_block_xpath',
		getPathBuilder: function () { return new XpathBuilder(); },
		getPathNodes: function (path) { return CustomBlockerUtil.getElementsByXPath(path); }
};
PathPickerDialog.targetHideCss = {
		none: false,
		isToHide: true,
		isToSearch: false,
		textboxId: 'rule_editor_hide_block_css',
		getPathBuilder: function () { return new CssBuilder(); },
		getPathNodes: function (path) { return CustomBlockerUtil.getElementsByCssSelector(path); }
};
PathPickerDialog.targetSearchXpath = {
		none: false,
		isToHide: false,
		isToSearch: true,
		textboxId: 'rule_editor_search_block_xpath',
		getPathBuilder: function () { return new XpathBuilder(); },
		getPathNodes: function (path) { return CustomBlockerUtil.getElementsByXPath(path); }
};
PathPickerDialog.targetSearchCss = {
		none: false,
		isToHide: false,
		isToSearch: true,
		textboxId: 'rule_editor_search_block_css',
		getPathBuilder: function () { return new CssBuilder(); },
		getPathNodes: function (path) { return CustomBlockerUtil.getElementsByCssSelector(path); }
};