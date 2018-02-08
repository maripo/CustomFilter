interface PathBuilder {
	createPathFilter (_path:string):PathFilter;

}
interface PathFilter {
	path:string;
	elements:HTMLElement[];
}

class CssBuilder implements PathBuilder {
	getIdExpression (elementId:string):string {
		return '#' + elementId;
	}
	getDescendantSeparator ():string {
		return " ";
	}
	getChildSeparator ():string {
		return ">";
	
	}
	getMultipleTagNameAndClassNameExpression (tagName:string, className:string):string {
		return tagName + '.' + className;
	}
	getSingleTagNameAndClassNameExpression (tagName:string, className:string):string {
		return tagName + '.' + className;
	}
	createPathFilter (_path:string):PathFilter {
		var path = CustomBlockerUtil.trim(_path);
		return new CssPathFilter(path);
	}
}
// TODO interface
class CssPathFilter implements PathFilter {
	path:string;
	elements:HTMLElement[];
	constructor (path: string) {
		this.path = path;
		this.elements = CustomBlockerUtil.getElementsByCssSelector(path);
	}
}