var ElementHighlighter = function () {
	this.hideElements = null;
	this.searchElements = null;
};
ElementHighlighter.prototype.highlightRule = function (rule)
{
	var searchNodes = [];
	var hideNodes = [];
	if (rule)
	{
		var searchNodes = (rule.block_anyway)?[]:(
				(rule.search_block_by_css)?
					CustomBlockerUtil.getElementsByCssSelector(rule.search_block_css)
					:
					CustomBlockerUtil.getElementsByXPath(rule.search_block_xpath)
				);
		var hideNodes = (rule.hide_block_by_css)?
				CustomBlockerUtil.getElementsByCssSelector(rule.hide_block_css)
				:
				CustomBlockerUtil.getElementsByXPath(rule.hide_block_xpath);
	}
	this.highlightSearchElements(searchNodes);
	this.highlightHideElements(hideNodes);
};
ElementHighlighter.prototype.highlightHideElements = function (elements)
{
	if (this.hideElements)
	{
		for (var i=0, l=this.hideElements.length; i<l; i++) {
			if (!CustomBlockerUtil.isContained(this.hideElements[i], document.getElementById('rule_editor_container')))
				ElementHighlighter.unselectForHide(this.hideElements[i]);
		}
	}
	//Apply Styles
	if (elements)
	{
		for (var i=0; i<elements.length; i++)
		{
			if (!CustomBlockerUtil.isContained(elements[i], document.getElementById('rule_editor_container')))
				ElementHighlighter.selectForHide(elements[i]);
		}
	}
	this.hideElements = elements;
};
ElementHighlighter.prototype.highlightSearchElements = function (elements)
{
	if (this.searchElements)
	{
		for (var i=0, l=this.searchElements.length; i<l; i++) {
			if (!CustomBlockerUtil.isContained(this.searchElements[i], document.getElementById('rule_editor_container')))
				ElementHighlighter.unselectForSearch(this.searchElements[i]);
		}
	}
	//Apply Styles
	if (elements)
	{
		for (var i=0; i<elements.length; i++)
		{
			if (!CustomBlockerUtil.isContained(elements[i], document.getElementById('rule_editor_container')))
				ElementHighlighter.selectForSearch(elements[i]);
		}
	}
	this.searchElements = elements;
};

ElementHighlighter.selectForHide = function (element)
{
	if (null==element.originalStyle)
		element.originalStyle = (null!=element.style.outline)?element.style.outline:" ";
	element.isSelectedForHide = true;
	element.style.outline = ElementHighlighter.STYLE_SELECT_FOR_HIDE;
	element.style.position = 'relative';
	var div = document.createElement('DIV');
	with (div.style)
	{
		backgroundColor = 'black';
		position = 'absolute';
		left = '0px';
		top = '0px';
		opacity = 0.3;
		width = element.clientWidth + 'px';
		height = element.clientHeight + 'px';
	}
	element.appendChild(div);
	element.coverDiv = div;
};
ElementHighlighter.unselectForHide = function (element)
{
	if (element.coverDiv)
		element.removeChild (element.coverDiv);
	element.coverDiv = null;
	element.isSelectedForHide = false;
	if (element.isSelectedForSearch) 
		element.style.outline = ElementHighlighter.STYLE_SELECT_FOR_SEARCH;
	else
		element.style.outline = element.originalStyle;
};
ElementHighlighter.selectForSearch = function (element)
{
	if (null==element.originalStyle)
		element.originalStyle = (null!=element.style.outline)?element.style.outline:"";
	element.isSelectedForSearch = true;
	element.style.outline = ElementHighlighter.STYLE_SELECT_FOR_SEARCH;
};
ElementHighlighter.unselectForSearch = function (element)
{
	element.isSelectedForSearch = false;
	if (element.isSelectedForHide) 
		element.style.outline = ElementHighlighter.STYLE_SELECT_FOR_HIDE;
	element.style.outline = element.originalStyle;
};

ElementHighlighter.STYLE_FOCUS_FOR_HIDE = 'solid 2px black';
ElementHighlighter.STYLE_FOCUS_FOR_SEARCH = 'solid 2px blue';
ElementHighlighter.STYLE_TMP_SELECT_FOR_HIDE = 'dotted 2px black';
ElementHighlighter.STYLE_TMP_SELECT_FOR_SEARCH = 'dotted 2px blue';
ElementHighlighter.STYLE_SELECT_FOR_HIDE = 'solid 1px black';
ElementHighlighter.STYLE_SELECT_FOR_SEARCH = 'solid 1px blue';