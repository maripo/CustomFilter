class XpathBuilder {
	getIdExpression (elementId: string): string {
		return 'id("' + elementId + '")';
	}
	getDescendantSeparator (): string {
		return "//";
	}
	getChildSeparator(): string {
		return "/";
	}
	getMultipleTagNameAndClassNameExpression (tagName:string, className:string): string {
		return tagName
		+ '[contains(concat(" ",normalize-space(@class)," "),"'
		+ className
		+'")]';
	}
	getSingleTagNameAndClassNameExpression (tagName:string, className:string)
	{
		return tagName + '[@class="' + className + '"]';
	}
	createPathFilter (_path): XpathPathFilter {
		let path = CustomBlockerUtil.trim(_path);
		return new XpathPathFilter(path);
	}
}

class XpathPathFilter {
	path:string;
	elements:HTMLElement[];
	constructor (path:string) 
	{
		this.path = path;
		this.elements = CustomBlockerUtil.getElementsByXPath(path);
	}
}