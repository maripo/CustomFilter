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
		var index = 0;
		while (node && 'BODY'!=node.className) 
		{
			this.ancestors.push(new PathElement(node, index));
			if (document.body == node) break;
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
		console.log(this.uniqPathList[i])
		this.pathList.push(new PathFilter(this.uniqPathList[i]));
	}
	console.log("length=" + this.uniqPathList.length);
	return this.pathList; 
};
PathAnalyzer.SEQ_LIMIT = 2;
PathAnalyzer.prototype.scan = function (index, seq)
{
	var current = this.ancestors[index];
	for (var i=0, l=current.options.length; i<l; i++) 
	{
		var cloneSeq = PathAnalyzer.cloneArray(seq);
		cloneSeq.push(current.options[i]);
		if (cloneSeq.length<PathAnalyzer.SEQ_LIMIT && this.ancestors.length>index+1)
			this.scan(index+1, PathAnalyzer.cloneArray(PathAnalyzer.cloneArray(cloneSeq)));
		this.addSeq(cloneSeq);
	}
	//Add Nothing
	if (index>0 && seq.length<PathAnalyzer.SEQ_LIMIT && this.ancestors.length>index+1)
		this.scan(index+1, PathAnalyzer.cloneArray(seq));
};
PathAnalyzer.prototype.addSeq = function (seq)
{
	var str = '';
	for (var i=0, l=seq.length; i<l; i++)
	{
		str = seq[i] + str;
	}
	if (!Util.arrayContains(this.uniqPathList, str)) this.uniqPathList.push(str);
}



PathAnalyzer.cloneArray = function (orig) 
{
	var array = new Array();
	for (var i=0, l=orig.length; i<l; i++) 
	{
		array[i] = orig[i]; 
	}
	return array;
};


/**
 * PathElement
 */
var splitSpacesRegExp = new RegExp(' +', 'g');
var PathElement = function (node, index) 
{
	this.node = node;
	this.isTarget = false;
	this.parentNode = null;
	this.upperKeyNode = null;
	this.classes = (null==node.className||''==node.className)?new Array():node.className.replace(splitSpacesRegExp, ' ').split(' ');

	var tagName = this.node.tagName;
	
	this.options = new Array();
	if (this.classes.length>1 || index == 0)
	{
		for (var i=0, l=this.classes.length; i<l; i++)
		{
			var xpath = '//'
				+tagName
				+'[contains(concat(" ",normalize-space(@class)," "),"'
				+this.classes[i]
				+'")]';
			this.options.push(xpath);
		}
	}
	else if (this.classes.length==1)
	{
		var className = this.classes[0];
		this.options.push('//'+this.node.tagName+'[@class="'+className+'"]');
	}
	this.options.push("//"+this.node.tagName);	
};
