var CssBuilder = (function () {
    function CssBuilder() {
    }
    CssBuilder.prototype.getIdExpression = function (elementId) {
        return '#' + elementId;
    };
    CssBuilder.prototype.getDescendantSeparator = function () {
        return " ";
    };
    CssBuilder.prototype.getChildSeparator = function () {
        return ">";
    };
    CssBuilder.prototype.getMultipleTagNameAndClassNameExpression = function (tagName, className) {
        return tagName + '.' + className;
    };
    CssBuilder.prototype.getSingleTagNameAndClassNameExpression = function (tagName, className) {
        return tagName + '.' + className;
    };
    CssBuilder.prototype.createPathFilter = function (_path) {
        var path = CustomBlockerUtil.trim(_path);
        return new CssPathFilter(path);
    };
    return CssBuilder;
}());
var CssPathFilter = (function () {
    function CssPathFilter(path) {
        this.path = path;
        this.elements = CustomBlockerUtil.getElementsByCssSelector(path);
    }
    return CssPathFilter;
}());
//# sourceMappingURL=css_builder.js.map