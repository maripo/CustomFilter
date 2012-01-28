var CssBuilder = function()
{
};
CssBuilder.prototype.getIdExpression = function (elementId)
{
	return '#' + elementId;
};
CssBuilder.prototype.getDescendantSeparator = function ()
{
	return " ";
};
CssBuilder.prototype.getChildSeparator = function ()
{
	return ">";
};
CssBuilder.prototype.getMultipleTagNameAndClassNameExpression = function (tagName, className)
{
	return tagName + '.' + className;
};
CssBuilder.prototype.getSingleTagNameAndClassNameExpression = function (tagName, className)
{
	return tagName + '.' + className;
};
CssBuilder.prototype.createPathFilter = function (path)
{
	return new CssPathFilter(path);
};
var CssPathFilter = function (xpath) 
{
	this.xpath = xpath; //TODO rename
	this.elements = CustomBlockerUtil.getElementsByXPath(xpath); //TODO
};