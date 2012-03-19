/**
 * SmartPathAnalyzer
 */
/*
 * Usage
			var analyzer = new SmartPathAnalyzer(node, (Xpath|Css)Builder);
			var list = analyzer.createPathList();
 */
var SmartPathAnalyzer = function (_node, _builder)
{
	this._node = _node;
	this._builder = _builder;
};
SmartPathAnalyzer.prototype.createPathList = function ()
{
	var hideOriginalNode = this._node;
	var pathList = new Array();
	while (hideOriginalNode)
	{
		var siblings = CustomBlockerUtil.getSimilarSiblings(hideOriginalNode);
		if (siblings.length>0)
		{
			//Test
			/*
			for (var i=0; i<siblings.length; i++)
			{
				siblings[i].style.outline = 'solid 2px orange';
			}
			*/
			this.analyzerHideNode(hideOriginalNode, this._node, pathList);
		}
		hideOriginalNode = hideOriginalNode.parentNode;
	}
	return pathList;

};
var pathCount  = 0;
SmartPathAnalyzer.prototype.analyzerHideNode = function (hideOriginalNode, originalNode, pathList)
{
	var hidePathSelectors = new PathAnalyzer(hideOriginalNode, new XpathBuilder()).createPathList();
	for (var i=hidePathSelectors.length-1; i>=0; i--)
	{
		var hidePathSelector = hidePathSelectors[i];
		var hideElements = CustomBlockerUtil.getElementsByXPath(hidePathSelector.path);
		var siblingFound = false;
		for (var hideIndex=0; hideIndex<hideElements.length; hideIndex++)
		{
			if (hideElements[hideIndex]!=hideOriginalNode && hideElements[hideIndex].parentNode==hideOriginalNode.parentNode)
			{
				siblingFound = true;
			}		
		}
		
		if (hideElements.length>1 && siblingFound) 
		{
			var searchOriginalNode = originalNode;
			while (CustomBlockerUtil.isContained(searchOriginalNode, hideOriginalNode))
			{
	            var searchPathSelectors = new PathAnalyzer(searchOriginalNode, new XpathBuilder(), hideOriginalNode, hidePathSelector.path).createPathList();
	            for (var searchIndex =0; searchIndex<searchPathSelectors.length; searchIndex++)
	            {
	            	var searchPathSelector = searchPathSelectors[searchIndex];
	            	var searchSelectedNodes = searchPathSelector.elements;
	            	var searchElements = CustomBlockerUtil.getElementsByXPath(searchPathSelector.path);
	            	var containedNode = CustomBlockerUtil.getContainedElements(hideElements, searchElements);
	            	if (containedNode.length>1)
	            	{
	            	
	            		pathList.push(new SmartPath(hidePathSelector, searchPathSelector));
					}	            	
	            }
				searchOriginalNode = searchOriginalNode.parentNode;
			}
		}		
	}
};
var SmartPath = function (hidePath, searchPath)
{
	this.hidePath = hidePath;
	this.searchPath = searchPath;
};