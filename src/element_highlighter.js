var ElementHighlighter = function () {
	this.hideElements = null;
	this.searchElements = null;
};
ElementHighlighter.prototype.highlightHideElements = function (elements)
{
	if (this.hideElements)
	{
		for (var i=0, l=this.hideElements.length; i<l; i++) {
			if (this.hideElements[i].unselectForHide)
				this.hideElements[i].unselectForHide();
		}
	}
	//Apply Styles
	if (elements)
	{
		for (var i=0; i<elements.length; i++)
		{
			if (elements[i].selectForHide)
			{
				elements[i].selectForHide();
			}
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
			if (this.searchElements[i].unselectForSearch)
				this.searchElements[i].unselectForSearch();
		}
	}
	//Apply Styles
	if (elements)
	{
		for (var i=0; i<elements.length; i++)
		{
			if (elements[i].selectForSearch)
			{
				elements[i].selectForSearch();
			}
		}
	}
	//apply styles
	this.searchElements = elements;
};