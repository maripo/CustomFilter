/**
 * PathElement
 */
var splitSpacesRegExp = new RegExp('[ \\n]+', 'g');
class PathElement {
	node;
	builder;
	isTarget:boolean;
	parentNode;
	upperKeyNode;
	classes;
	options:string[];
	constructor (node, index:number, builder) {
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
				if (this.classes[i]=='') continue;
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
	}
}

/**
 * PathAnalyzer
 */
/*
 * Usage
			var analyzer = new PathAnalyzer(node, (Xpath|Css)Builder, (true|false));
			var list = analyzer.createPathList();
 */
class PathAnalyzer {
	builder:any;
	targetNode:any;
	rootNode:any;
	basePath:any;
	pathList:PathFilter[];
	ancestors:PathElement[];
	seqList;
	static SEQ_LIMIT:number;
	uniqPathList:string[];
	
	constructor (targetNode, builder, rootNode, basePath) {
		this.builder = builder;
		this.targetNode = targetNode;
		this.rootNode = rootNode || document.body; //User Relatve Path
		this.basePath = basePath || '';
		this.pathList = null;
		this.ancestors = []; /*<PathElement>*/
	}
	public createPathList (): PathFilter[] {
		{
			let node = this.targetNode;
			let index = 0;
			while (node) {
				if (this.rootNode == node) break;
				let element = new PathElement(node, index, this.builder);
				this.ancestors.push(element);
				node = node.parentNode;
				index ++;
			}
		}
		for (let i=0, l=this.ancestors.length; i<l; i++) {
			let childNode = (i>0)? this.ancestors[i-1]:null;
			let node = this.ancestors[i];
			node.isTarget = (0==i);
		}
		this.seqList = [];
		this.pathList = [];
		this.uniqPathList = [];
		if (this.ancestors.length>0)
			this.scan(0, new Array());
		if (this.basePath.length>0) {
			this.pathList.push(this.builder.createPathFilter(this.basePath));
		}
		for (let i=0, l=this.uniqPathList.length; i<l; i++) {
			try {
				let path = this.builder.createPathFilter(this.basePath + this.uniqPathList[i]);		
				//Exclude nested elements
				var nested = false;
				for (var elementIndex=0; elementIndex<path.elements.length; elementIndex++)
				{
					var element = path.elements[elementIndex];
					if (element != this.targetNode && 
						(CustomBlockerUtil.isContained(this.targetNode, element) || CustomBlockerUtil.isContained(element, this.targetNode)) ) 
					{
						nested = true;
					}
				}
				if (!nested)
					this.pathList.push(path);
			}
			catch (ex)
			{
				console.log(ex);
			}
		}
		this.pathList.sort(
				function(a:PathFilter, b:PathFilter) {
						return (a.elements.length==b.elements.length)?
								(a.path.length-b.path.length):(a.elements.length - b.elements.length);
				});
		let list:PathFilter[] = [];
		let prevPath = null;
		for (let i=0, l=this.pathList.length; i<l; i++)
		{
			var path = this.pathList[i];
			if (!prevPath || prevPath.elements.length!=path.elements.length) {
				list.push(path);
			}
			prevPath = path;
		}
		return list; 
	}
	scan (index, seq): void {
		var current = this.ancestors[index];
		for (let i=0, l=current.options.length; i<l; i++) {
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
		if (this.rootNode==document.body && current.node.id) {
			var cloneSeq = PathAnalyzer.cloneArray(seq);
			cloneSeq.push({path:this.builder.getIdExpression(current.node.id),index:index, hasId:true});
			this.addSeq(cloneSeq);
		}
	}
	addSeq (seq): void {
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
	static cloneArray (orig:any[]): any[] {
		var array = new Array();
		for (var i=0, l=orig.length; i<l; i++) 
		{
			array[i] = {path:orig[i].path, index:orig[i].index}; 
		}
		return array;
	}
	static initialize (): void {
		PathAnalyzer.SEQ_LIMIT = 2;	
	}
}


