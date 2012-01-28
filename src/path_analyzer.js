/**
 * PathAnalyzer
 */
/*
 * Usage
			var analyzer = new PathAnalyzer(node, (Xpath|Css)Builder);
			var list = analyzer.createPathList();
 */
var PathAnalyzer = function (_node, _builder)
{
	console.log("new PathAnalyzer _node=" + _node + ", _builder=" + _builder);
	this.builder = _builder;
	this.targetNode = _node;
	this.pathList = null;
	this.ancestors = new Array/*<PathElement>*/();
};
PathAnalyzer.prototype.createPathList = function () 
{
	{
		var node = this.targetNode;
		var index = 0;
		while (node) 
		{
			if (document.body == node) break;
			this.ancestors.push(new PathElement(node, index, this.builder));
			node = node.parentNode;
			index ++;
		}
	}
	for (var i=0, l=this.ancestors.length; i<l; i++) 
	{
		var childNode = (i>0)? this.ancestors[i-1]:null;
		var node = this.ancestors[i];
		node.isTarget = (0==i);
	}
	this.seqList = new Array();
	this.pathList = new Array();
	this.uniqPathList = new Array();
	this.scan(0, new Array());
	for (var i=0, l=this.uniqPathList.length; i<l; i++)
	{
		this.pathList.push(this.builder.createPathFilter(this.uniqPathList[i]));
	}
	this.pathList.sort(
			function(a,b)
			{
					return (a.elements.length==b.elements.length)?
							(a.xpath.length-b.xpath.length):(a.elements.length - b.elements.length);
			});
	var list = new Array();
	var prevPath = null;
	for (var i=0, l=this.pathList.length; i<l; i++)
	{
		var path = this.pathList[i];
		if (!prevPath || prevPath.elements.length!=path.elements.length)
			list.push(path);
		prevPath = path;
	}
	return list; 
};
PathAnalyzer.SEQ_LIMIT = 2;
PathAnalyzer.prototype.scan = function (index, seq)
{
	var current = this.ancestors[index];
	for (var i=0, l=current.options.length; i<l; i++) 
	{
		var cloneSeq = PathAnalyzer.cloneArray(seq);
		var option = current.options[i]; 
		cloneSeq.push({path:option, index:index});
		if (cloneSeq.length<PathAnalyzer.SEQ_LIMIT && this.ancestors.length>index+1)
			this.scan(index+1, PathAnalyzer.cloneArray(PathAnalyzer.cloneArray(cloneSeq)));
		this.addSeq(cloneSeq);
	}
	//Add Nothing
	if (index>0 && seq.length<PathAnalyzer.SEQ_LIMIT && this.ancestors.length>index+1)
		this.scan(index+1, PathAnalyzer.cloneArray(seq));
	if (current.node.id) {
		var cloneSeq = PathAnalyzer.cloneArray(seq);
		cloneSeq.push({path:this.builder.getIdExpression(current.node.id),index:index, hasId:true});
		this.addSeq(cloneSeq);
	}
};
PathAnalyzer.prototype.addSeq = function (seq)
{
	var str = '';
	for (var i=0, l=seq.length; i<l; i++)
	{
		var next = (i<l-1)?seq[i+1]:null;
		var current = seq[i];
		str = current.path + str;
		if (current.hasId) 
		{
			
		}
		else if ((next && next.index==current.index+1) || 'BODY'==current.path)
			str = this.builder.getChildSeparator() + str;
		else
			str = this.builder.getDescendantSeparator() + str;
	}
	if (!CustomBlockerUtil.arrayContains(this.uniqPathList, str)) this.uniqPathList.push(str);
}



PathAnalyzer.cloneArray = function (orig) 
{
	var array = new Array();
	for (var i=0, l=orig.length; i<l; i++) 
	{
		array[i] = {path:orig[i].path, index:orig[i].index}; 
	}
	return array;
};


/**
 * PathElement
 */
var splitSpacesRegExp = new RegExp(' +', 'g');
var PathElement = function (node, index, builder) 
{
	this.node = node;
	this.builder = builder;
	this.isTarget = false;
	this.parentNode = null;
	this.upperKeyNode = null;
	this.classes = (null==node.className||''==node.className)?new Array():node.className.replace(splitSpacesRegExp, ' ').split(' ');

	var tagName = this.node.tagName;
	
	this.options = new Array();
	if ((this.classes.length>1 || index == 0) && 'BODY'!=tagName)
	{
		for (var i=0, l=this.classes.length; i<l; i++)
		{
			var xpath = this.builder.getMultipleTagNameAndClassNameExpression(tagName, this.classes[i]);
			this.options.push(xpath);
		}
	}
	else if (this.classes.length==1 && 'BODY'!=tagName)
	{
		var className = this.classes[0];
		this.options.push(this.builder.getSingleTagNameAndClassNameExpression(this.node.tagName, className));
	}
	if ('DIV'!=tagName && 'UL' != tagName)
		this.options.push(this.node.tagName);	
};
