var XpathBuilder = (function () {
    function XpathBuilder() {
    }
    XpathBuilder.prototype.getIdExpression = function (elementId) {
        return 'id("' + elementId + '")';
    };
    XpathBuilder.prototype.getDescendantSeparator = function () {
        return "//";
    };
    XpathBuilder.prototype.getChildSeparator = function () {
        return "/";
    };
    XpathBuilder.prototype.getMultipleTagNameAndClassNameExpression = function (tagName, className) {
        return tagName
            + '[contains(concat(" ",normalize-space(@class)," "),"'
            + className
            + '")]';
    };
    XpathBuilder.prototype.getSingleTagNameAndClassNameExpression = function (tagName, className) {
        return tagName + '[@class="' + className + '"]';
    };
    XpathBuilder.prototype.createPathFilter = function (_path) {
        var path = CustomBlockerUtil.trim(_path);
        return new XpathPathFilter(path);
    };
    return XpathBuilder;
}());
var XpathPathFilter = (function () {
    function XpathPathFilter(path) {
        this.path = path;
        this.elements = CustomBlockerUtil.getElementsByXPath(path);
    }
    return XpathPathFilter;
}());
//# sourceMappingURL=xpath_builder.js.map