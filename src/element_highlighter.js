var ElementHighlighter = function () {
	this.hideElements = null;
	this.searchElements = null;
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
	//Apply styles
	this.hideElements = elements;
};
ElementHighlighter.prototype.highlightSearchElements = function (elements)
{
	if (this.searchElements)
	{
		//restore styles
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
	//apply styles
	this.searchElements = elements;
};

ElementHighlighter.selectForHide = function (element)
{
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