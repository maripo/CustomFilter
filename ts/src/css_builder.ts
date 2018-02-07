class CssBuilder {
	getIdExpression (elementId:string):string
	{
		return '#' + elementId;
	}
	getDescendantSeparator ():string
	{
		return " ";
	}
	getChildSeparator ():string {
		return ">";
	
	}
	getMultipleTagNameAndClassNameExpression (tagName:string, className:string):string
	{
		return tagName + '.' + className;
	}
	getSingleTagNameAndClassNameExpression (tagName:string, className:string):string
	{
		return tagName + '.' + className;
	}
	createPathFiltern (_path:string)
	{
		var path = CustomBlockerUtil.trim(_path);
		return new CssPathFilter(path);
	}
}
// TODO interface
class CssPathFilter {
	path:string;
	elements:HTMLElement[];
	constructor (path: string) {
		this.path = path;
		this.elements = CustomBlockerUtil.getElementsByCssSelector(path);
	}
}