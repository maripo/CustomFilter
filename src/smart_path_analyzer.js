/**
 * SmartPathAnalyzer
 */
/*
 * Usage
			var analyzer = new SmartPathAnalyzer(node, (Xpath|Css)Builder);
			var list = analyzer.createPathList();
 */
var SmartPathAnalyzer = function (_node, builder)
{
	this._node = _node;
	this.builder = builder;
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
			this.analyzerHideNode(hideOriginalNode, this._node, pathList);
		}
		hideOriginalNode = hideOriginalNode.parentNode;
	}
	return pathList;

};
var pathCount  = 0;
SmartPathAnalyzer.prototype.analyzerHideNode = function (hideOriginalNode, originalNode, pathList)
{
	var hidePathSelectors = new PathAnalyzer(hideOriginalNode, this.builder).createPathList();
	for (var i=hidePathSelectors.length-1; i>=0; i--)
	{
		var hidePathSelector = hidePathSelectors[i];
		var hideElements = hidePathSelector.elements;
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
				var searchPathSelectors = new PathAnalyzer(searchOriginalNode, this.builder, hideOriginalNode, hidePathSelector.path).createPathList();
				for (var searchIndex =0; searchIndex<searchPathSelectors.length; searchIndex++)
				{
					var searchPathSelector = searchPathSelectors[searchIndex];
					var searchSelectedNodes = searchPathSelector.elements;
					var searchElements = searchPathSelector.elements;
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