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
			ElementHighlighter.unselectForHide(this.hideElements[i]);
		}
	}
	//Apply Styles
	if (elements)
	{
		for (var i=0; i<elements.length; i++)
		{
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
			ElementHighlighter.unselectForSearch(this.searchElements[i]);
		}
	}
	//Apply Styles
	if (elements)
	{
		for (var i=0; i<elements.length; i++)
		{
			ElementHighlighter.selectForSearch(elements[i]);
		}
	}
	this.searchElements = elements;
};

ElementHighlighter.selectForHide = function (element)
{
	if (!element.originalStyle)
		element.originalStyle = (element.style.outline)?element.style.outline:"";
	element.isSelectedForHide = true;
	element.style.outline = RuleElement.STYLE_SELECT_FOR_HIDE;
};
ElementHighlighter.unselectForHide = function (element)
{
	element.isSelectedForHide = false;
	if (element.isSelectedForSearch) 
		element.style.outline = RuleElement.STYLE_SELECT_FOR_SEARCH;
	else
		element.style.outline = element.originalStyle;
};
ElementHighlighter.selectForSearch = function (element)
{
	if (!element.originalStyle)
		element.originalStyle = (element.style.outline)?element.style.outline:"";
	element.isSelectedForSearch = true;
	element.style.outline = RuleElement.STYLE_SELECT_FOR_SEARCH;
};
ElementHighlighter.unselectForSearch = function (element)
{
	element.isSelectedForSearch = false;
	if (element.isSelectedForHide) 
		element.style.outline = RuleElement.STYLE_SELECT_FOR_HIDE;
	element.style.outline = element.originalStyle;
};