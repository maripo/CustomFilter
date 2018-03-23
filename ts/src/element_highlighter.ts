class ElementHighlighter {
	hideElements: HTMLElement[];
	searchElements: HTMLElement[];
	coverDivs: HTMLElement[];
	static STYLE_FOCUS_FOR_HIDE: string;
	static STYLE_FOCUS_FOR_SEARCH: string;
	static STYLE_TMP_SELECT_FOR_HIDE: string;
	static STYLE_TMP_SELECT_FOR_SEARCH: string;
	static STYLE_SELECT_FOR_HIDE: string;
	static STYLE_SELECT_FOR_SEARCH: string;
	constructor () {
		this.hideElements = null;
		this.searchElements = null;
	}
	highlightRule (rule:Rule) {
		let searchNodes:HTMLElement[] = [];
		let hideNodes:HTMLElement[] = [];
		if (rule) {
			let searchNodes = (rule.block_anyway)?[]:(
					(rule.search_block_by_css)?
						CustomBlockerUtil.getElementsByCssSelector(rule.search_block_css)
						:
						CustomBlockerUtil.getElementsByXPath(rule.search_block_xpath)
					);
			rule.searchNodes = searchNodes;
			let hideNodes = (rule.hide_block_by_css)?
					CustomBlockerUtil.getElementsByCssSelector(rule.hide_block_css)
					:
					CustomBlockerUtil.getElementsByXPath(rule.hide_block_xpath);
			rule.hideNodes = hideNodes;
		}
		this.highlightSearchElements(searchNodes);
		this.highlightHideElements(hideNodes);
	}
	highlightHideElements (elements: HTMLElement[]) {
		if (this.hideElements)
		{
			for (let i=0, l=this.hideElements.length; i<l; i++) {
				if (!CustomBlockerUtil.isContained(this.hideElements[i], document.getElementById('rule_editor_container')))
					this.unselectForHide(this.hideElements[i]);
			}
		}
		//Apply Styles
		if (elements)
		{
			for (let i=0; i<elements.length; i++)
			{
				if (!CustomBlockerUtil.isContained(elements[i], document.getElementById('rule_editor_container')))
					this.selectForHide(elements[i]);
			}
		}
		this.hideElements = elements;
	}
	highlightSearchElements (elements: HTMLElement[]) {
		if (this.searchElements)
		{
			for (let i=0, l=this.searchElements.length; i<l; i++) {
				if (!CustomBlockerUtil.isContained(this.searchElements[i], document.getElementById('rule_editor_container')))
					this.unselectForSearch(this.searchElements[i]);
			}
		}
		//Apply Styles
		if (elements)
		{
			for (let i=0; i<elements.length; i++)
			{
				if (!CustomBlockerUtil.isContained(elements[i], document.getElementById('rule_editor_container')))
					this.selectForSearch(elements[i]);
			}
		}
		this.searchElements = elements;
	}
	selectForHide (element)
	{
		if (null==element.originalStyle)
			element.originalStyle = (null!=element.style.outline)?element.style.outline:" ";
		element.isSelectedForHide = true;
		element.style.outline = ElementHighlighter.STYLE_SELECT_FOR_HIDE;
		
		// Change background color
		if ('inline' == window.getComputedStyle(element).display)
		{
			element.originalBackgroundColor = window.getComputedStyle(element).backgroundColor;
			element.style.backgroundColor = '#bbb';
			element.backgroundColorChanged = true;
		}
		// Add transparent cover
		else
		{
			let elementsToCover = new Array();
			if ('TR'==element.tagName)
			{
				let children = element.childNodes;
				for (let i=0; i<children.length; i++)
				{
					if (children[i].tagName)
					{
						elementsToCover.push(children[i]);
					}
				}
			}
			else
			{
				elementsToCover.push(element);
			}
			if (elementsToCover.length > 0)
			{
				let coverDivs = new Array();
				for (let i=0; i<elementsToCover.length; i++)
				{
					let elementToCover = elementsToCover[i];
					elementToCover.style.position = 'relative';
					let div = document.createElement('DIV');
					div.style.backgroundColor = 'black';
					div.style.position = 'absolute';
					div.style.left = '0px';
					div.style.top = '0px';
					div.style.opacity = "0.3";
					div.style.width = elementToCover.clientWidth + 'px';
					div.style.height = elementToCover.clientHeight + 'px';
					elementToCover.appendChild(div);
					coverDivs.push(div);
				}
				element.coverDivs = coverDivs;
			}
		}
	}
	unselectForHide (element)
	{
		/* Remove transparent cover div elements */
		if (element.coverDivs)
		{
			for (let i=0; i<element.coverDivs.length; i++)
			{
				let coverDiv = element.coverDivs[i];
				coverDiv.parentNode.removeChild (coverDiv);
			}
			element.coverDivs = null;
		}
		if (element.backgroundColorChanged)
		{
			element.style.backgroundColor = element.originalBackgroundColor;
			element.originalBackgroundColor = null;
			element.backgroundColorChanged = false;
		}
		element.isSelectedForHide = false;
		if (element.isSelectedForSearch) 
			element.style.outline = ElementHighlighter.STYLE_SELECT_FOR_SEARCH;
		else
			element.style.outline = element.originalStyle;
	}
	selectForSearch = function (element) {
		if (null==element.originalStyle)
			element.originalStyle = (null!=element.style.outline)?element.style.outline:"";
		element.isSelectedForSearch = true;
		element.style.outline = ElementHighlighter.STYLE_SELECT_FOR_SEARCH;
	}
	unselectForSearch (element)
	{
		element.isSelectedForSearch = false;
		if (element.isSelectedForHide) 
			element.style.outline = ElementHighlighter.STYLE_SELECT_FOR_HIDE;
		element.style.outline = element.originalStyle;
	}
}
ElementHighlighter.STYLE_FOCUS_FOR_HIDE = 'solid 2px black';
ElementHighlighter.STYLE_FOCUS_FOR_SEARCH = 'solid 2px #0db3ea';
ElementHighlighter.STYLE_TMP_SELECT_FOR_HIDE = 'dotted 2px black';
ElementHighlighter.STYLE_TMP_SELECT_FOR_SEARCH = 'dotted 2px #0db3ea';
ElementHighlighter.STYLE_SELECT_FOR_HIDE = 'solid 1px black';
ElementHighlighter.STYLE_SELECT_FOR_SEARCH = 'solid 1px #0db3ea';