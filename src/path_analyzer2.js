/**
 * PathAnalyzer
 * @param {Object} _node
 */
/*
 * Usage
			var analyzer = new PathAnalyzer(node);
			var list = analyzer.createPathList();
 */
var PathAnalyzer = function (_node) 
{
	this.targetNode = _node;
	this.pathList = null;
	this.ancestors = new Array/*<PathElement>*/();
};
PathAnalyzer.prototype.createPathList = function () 
{
	{
		var node = this.targetNode;
		while (node) 
		{
			this.ancestors.push(new PathElement(node));
			if (document.body == node) break;
			node = node.parentNode;
		}
	}
	for (var i=0, l=this.ancestors.length; i<l; i++) 
	{
		var childNode = (i>0)? this.ancestors[i-1]:null;
		var node = this.ancestors[i];
		node.isTarget = (0==i);
	}
	//ここから先をおしゃれに実装すべし
	/*
	 * 判断の基準になるのは
	 * 自身のclass (最強) 
	 * 	- 自身が複数クラスなら
	 *    - そのすべてのクラスについてマッチを調べる
	 *  - 自身が単独クラスなら
	 *    - @class=["hoge"]
	 *    - 部分一致
	 * tagName (必須)
	 * id (自分自身にidがついてる場合は必ず出す。絞り込む場合は、その上位のidをいくつか使う)
	 */
	return this.pathList;
};

PathAnalyzer.prototype.trace = function (index, types) 
{
	var length = this.sequence.length;
	var target = this.sequence[index];
	
	var trueArray = PathAnalyzer.cloneArray(types);
	trueArray[index] = true;
	var falseArray = PathAnalyzer.cloneArray(types);
	falseArray[index] = false;
	
	if (index < (length-3)/2) 
	{
		this.trace(index+1, trueArray);
		this.trace(index+1, falseArray);
	} else  {
		var trueFilter = new Filter(trueArray, this.sequence);
		var falseFilter = new Filter(falseArray, this.sequence);
		this.filters.push(trueFilter);
		this.filters.push(falseFilter);
	} 
};
PathAnalyzer.cloneArray = function (orig) 
{
	var array = new Array();
	for (var i=0, l=orig.length; i<l; i++) 
	{
		array[i] = orig[i]; 
	}
	return array;
};

PathAnalyzer.prototype.getUniquePath = function (index) 
{
	var targetNode = this.sequence[index];
	var edge = this.sequence[index+1];
	var upperNode = this.sequence[index+2];
};
PathAnalyzer.prototype.getMultiPathList = function (index) 
{
	var list = new Array();
	var targetNode = this.sequence[index];
	var upperNode = this.sequence[index+2];
	list.add('//' + targetNode.tagName);
	if (PathElement.notEmpty(targetNode.className)) 
	{
		var classes = targetNode.className.split(' ');
	}
	return list;
};

PathAnalyzer.prototype.getXPathList = function () 
{
	return new Array();
}

var PathNode = function (element) 
{
	this.element = element;
};
var PathEdge = function (elements) 
{
	this.elements = elements;
};

/**
 * PathElement
 * @param {Object} node
 */
var PathElement = function (node) 
{
	this.node = node;
	this.isTarget = false;
	this.parentNode = null;
	this.upperKeyNode = null;
}
PathElement.arrayContains = function (array, str) 
{
	for (var i=0, l=array.length; i<l; i++) if (str==array[i].xpath) return true;
	return false;
}
PathElement.prototype.countSimilarChildNodes = function (child, rootNode) 
{
	this.similarChildNodesCount = 0;
	if (!child) return;
	var childMatchCount = child.node.getElementsByTagName(rootNode.tagName).length;
	var selfMatchCount = this.node.getElementsByTagName(rootNode.tagName).length;
	if (childMatchCount==1 || childMatchCount==selfMatchCount) return;
	var tagName = child.node.tagName;
	var count = 0;
	var children = this.node.childNodes;
	for (var i=0, l=children.length; i<l; i++) 
	{
		if (tagName == children[i].tagName) 
		{
			if (children[i]==child.node) 
			{
				this.childIndex = count;
			}
			count++;
		}
	}
	this.childTagName = child.node.tagName;
	this.similarChildNodesCount = count;
}
var PartialFilter = function (targetNode, edge, branchNode,index, isMulti, allowId) 
{
		this.targetNode = targetNode;
		this.edge = edge;
		this.branchNode = branchNode;
		this.index = index;
		this.isMulti = isMulti;
		this.conditions = new Array();
		this.allowId = allowId;
};
PartialFilter.prototype.getDefId = function () 
{
	if (!isEmpty(this.targetNode.id)) return this.targetNode.id;
	for (var i=0, l=this.edge.elements.length; i<l; i++) 
	{
		if (!isEmpty(this.edge.elements[i].node.id))
			return this.edge.elements[i].node.id;
	}
	return null;
}

PartialFilter.prototype.findValidConditions = function (childFilter) 
{
	if (this.isMulti) this.findValidConditionsMulti(childFilter);
	else this.findValidConditionsUnique(childFilter);
};

PartialFilter.prototype.compareValidConditionsMulti = function (childFilter, xpath) 
{
	var addCount = 0;
	if (childFilter) 
	{
		for (var i=0, l=childFilter.conditions.length; i<l; i++) 
		{
			var condition = childFilter.conditions[i];
			var fullXPath = xpath + condition.getFullXPath();
			var hit = getRelativeElementsByXPath(this.branchNode.element.node.parentNode||this.branchNode.element.node, fullXPath);
			if (hit.length > condition.hitNodes.length) 
			{
				this.conditions.push(new FilterCondition(xpath, hit, condition));
				addCount ++;
			} 
		}
	}
	else 
	{
		var hit = getRelativeElementsByXPath(this.branchNode.element.node.parentNode||this.branchNode.element.node, xpath);
		if (hit.length>1) 
		{
			this.conditions.push(new FilterCondition(xpath, hit));
			addCount ++;
		}
	}
	return addCount;
}
PartialFilter.prototype.findValidConditionsMulti = function (childFilter) 
{
	var tagName = this.targetNode.element.node.tagName;
	{
		var xpath = '//' + tagName;
		if (childFilter) 
		{
			this.compareValidConditionsMulti(childFilter, xpath);
		} 
		else 
		{
			var hit = getRelativeElementsByXPath(this.branchNode.element.node.parentNode||this.branchNode.element.node, xpath);
			if (hit.length>1) 
			{
				this.conditions.push(new FilterCondition(xpath, hit));
			}
		}
	}
	{
		if (childFilter) 
		{
			var xpath = '';
			this.compareValidConditionsMulti(childFilter, xpath);
		}
	}
	//class名による検索
	var classNames = this._getClassNames(this.targetNode.element.node);
	for (var i=0, l=classNames.length; i<l; i++) 
	{
		var xpath = '//'
			+tagName
			+'[contains(concat(" ",normalize-space(@class)," "),"'
			+classNames[i]
			+'")]';
		
		if (childFilter) 
		{
			this.compareValidConditionsMulti(childFilter, xpath);
		}
		else 
		{
			var hit = getRelativeElementsByXPath(this.branchNode.element.node.parentNode||this.branchNode.element.node, xpath);
			if (hit.length > 1) 
			{
				this.conditions.push(new FilterCondition(xpath, hit));
			}
		}
	}
};

PartialFilter.prototype.compareValidConditionsUnique = function (childFilter, xpath) 
{
	var addCount = 0;
	if (childFilter) 
	{
		for (var i=0, l=childFilter.conditions.length; i<l; i++) 
		{
			var filter = new FilterCondition(xpath,childFilter.conditions[i].hitNodes, childFilter.conditions[i]);
			var condition = childFilter.conditions[i];
			var fullXPath = xpath + condition.getFullXPath();
			var hit = getRelativeElementsByXPath(this.branchNode.element.node.parentNode||this.branchNode.element.node, fullXPath);
			if (hit.length == condition.hitNodes.length) 
			{
				this.conditions.push(new FilterCondition(xpath, hit, condition));
				addCount ++;
			} 
		}
	} 
	else 
	{
		var hit = getRelativeElementsByXPath(this.branchNode.element.node.parentNode||this.branchNode.element.node, xpath);
		if (hit.length > 0) 
		{
			this.conditions.push(new FilterCondition(xpath, [this.targetNode.element.node]));
		}
	}
	return addCount;
};
PartialFilter.prototype.findValidConditionsUnique = function (childFilter) 
{
	//TODO 「結果的にユニークになる」条件はもっといろいろあるはず (特に、子フィルタがclass名などでフィルタしてると、ユニークに決まることもある)
	//allowIdの場合のみIDがあればそれで本決まり、そうでない場合は何種類も試せば良い
	
	var xpath;
	
	if (this.branchNode.element.node.tagName == 'BODY') 
	{
		xpath = '//BODY';
		this.compareValidConditionsUnique(childFilter,xpath);
		return;
	}
	else 
	{
		var defId = this.getDefId();
		if (this.allowId && !isEmpty(defId)) 
		{
			xpath = 'id("' + defId + '")';
		}
		else 
		{
			//TODO class名で特定可能
			var elements = this.getElementsLinearList();
			var addCount = 0;
			
			for (var i=0, l=elements.length; i<l; i++) 
			{
				var node = elements[i].node;
				var classNames = this._getClassNames(node);
				for (var j = 0; j < classNames.length; j++) 
				{
					var xpath = '//'
						+node.tagName
						+'[contains(concat(" ",normalize-space(@class)," "),"'
						+classNames[j]
						+'")]';
					var addCount = this.compareValidConditionsUnique(childFilter,xpath);
					if (addCount>0) return;
				}
			}
			if (addCount==0) 
			{
				xpath = '//' + this.branchNode.element.childTagName + '[' + (this.branchNode.element.childIndex + 1) + ']';

				var count = this.compareValidConditionsUnique(childFilter,xpath);
			}
		}
	}
};
PartialFilter.prototype.getElementsLinearList = function () 
{
	var list = new Array();
	list.push(this.targetNode.element);
	for (var i=0, l=this.edge.elements.length; i<l; i++) 
	{
		list.push(this.edge.elements[i]);
	}
	return list;
};
var splitSpacesRegExp = new RegExp(' +', 'g');
PartialFilter.prototype._getClassNames = function (node) 
{
	var str = node.className;
	if (isEmpty(str)) return new Array();
	return str.replace(splitSpacesRegExp, ' ').split(' ');
};
function isEmpty (str) 
{
	return (null==str || ''==str);
};
var Filter = function (boolArray, sequence) 
{
	this.sequence = sequence;
	this.partialFilters = new Array();
	//TODO 最後の "false" だった場合は、それより上はpushしない
	var lastUniqueIndex = boolArray.length;
	
	for (var i=boolArray.length-1; i>=0; i--) 
	{
		if (false == boolArray[i]) 
		{
			lastUniqueIndex = i+1;
		} 
		else 
		{
			break;
		}
	}
	
	for (var i=0; i<lastUniqueIndex; i++) 
	{
		var partial = new PartialFilter(
			this.sequence[i*2],
			this.sequence[i*2+1],
			this.sequence[i*2+2],
			i,
			boolArray[i],
			(i==lastUniqueIndex-1 && !boolArray[i])
		);
		this.partialFilters.push(partial);
	}
};
Filter.prototype.analyze = function (list) 
{
	//console.log("Filter.analyze length=" + this.partialFilters.length);
	for (var i=0, l=this.partialFilters.length; i<l;i++) 
	{
		var partial = this.partialFilters[i];
		var childFilter = (i>0)?this.partialFilters[i-1]:null;
		partial.findValidConditions(childFilter);
	}
	var topFilter = this.partialFilters[this.partialFilters.length-1];
	for (var i=0, l=topFilter.conditions.length; i<l; i++) 
	{
		list.push(new PathFilter(topFilter.conditions[i].getFullXPath()))
	}
};
var FilterCondition = function (xpath, hitNodes, childFilter) 
{
	this.xpath = xpath;
	this.hitNodes = hitNodes;
	this.childFilter = childFilter;
};
FilterCondition.prototype.getFullXPath = function () 
{
	if (this.childFilter) 
	{
		return this.xpath + this.childFilter.getFullXPath();
	}
	else 
		return this.xpath;
}
// TODO フルパスを表示できるようにすべき 
// TODO Utilに引っ越すべき
PathElement.notEmpty = function (str) 
{
	return (str && ''!=str);
}

// TODO Utilに引っ越すべき
function getRelativeElementsByXPath(targetNode, xpath)
{
	var list = new Array();
	try 
	{
		var result = document.evaluate(xpath, targetNode, null, XPathResult.ANY_TYPE, null);
		var node;
		
		while (node = result.iterateNext()) 
		{
			list.push(node);
		}
	} 
	catch (e) 
	{
		console.log(e)
	}
	return list;
}