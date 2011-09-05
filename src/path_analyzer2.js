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
	this.pathList = new Array();
	{
		var testNode = this.ancestors[0];
		var tagName = testNode.node.tagName;
		if (testNode.classes.length>1)
		{
			for (var i=0, l=testNode.classes.length; i<l; i++)
			{
				var xpath = '//'
					+tagName
					+'[contains(concat(" ",normalize-space(@class)," "),"'
					+testNode.classes[i]
					+'")]';
				this.pathList.push(new PathFilter(xpath));
			}
		}
		else if (testNode.classes.length==1)
		{
			var className = testNode.classes[0];
			this.pathList.push(new PathFilter('//'+testNode.node.tagName+'[@class="'+className+'"]'));

			var xpath = '//'
				+tagName
				+'[contains(concat(" ",normalize-space(@class)," "),"'
				+testNode.classes[0]
				+'")]';
			this.pathList.push(new PathFilter(xpath));
		}
		else
		{
			this.pathList.push(new PathFilter("//"+testNode.node.tagName));
		}
	}
	/*
	 * そもそも、「クラスあり」と「クラスなし」で明確にわけたほうがいいんじゃなかろーか?
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
 */
var splitSpacesRegExp = new RegExp(' +', 'g');
var PathElement = function (node) 
{
	this.node = node;
	this.isTarget = false;
	this.parentNode = null;
	this.upperKeyNode = null;
	this.classes = (null==node.className||''==node.className)?new Array():node.className.replace(splitSpacesRegExp, ' ').split(' ');
}
// 参考としてとっておくが、あとでけす。
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

function isEmpty (str) 
{
	return (null==str || ''==str);
};
// TODO フルパスを表示できるようにすべき 
// TODO Utilに引っ越すべき
PathElement.notEmpty = function (str) 
{
	return (str && ''!=str);
}
//TODO Utilに引っ越すべき
PathElement.arrayContains = function (array, str) 
{
	for (var i=0, l=array.length; i<l; i++) if (str==array[i].xpath) return true;
	return false;
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