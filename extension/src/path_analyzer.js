var splitSpacesRegExp = new RegExp('[ \\n]+', 'g');
var PathElement = (function () {
    function PathElement(node, index, builder) {
        this.node = node;
        this.builder = builder;
        this.isTarget = false;
        this.parentNode = null;
        this.upperKeyNode = null;
        this.classes = (null == node.className || '' == node.className) ? new Array() : node.className.replace(splitSpacesRegExp, ' ').split(' ');
        var tagName = this.node.tagName;
        this.options = new Array();
        if ((this.classes.length > 1 || index == 0) && 'BODY' != tagName) {
            for (var i = 0, l = this.classes.length; i < l; i++) {
                if (this.classes[i] == '')
                    continue;
                var xpath = this.builder.getMultipleTagNameAndClassNameExpression(tagName, this.classes[i]);
                this.options.push(xpath);
            }
        }
        else if (this.classes.length == 1 && 'BODY' != tagName) {
            var className = this.classes[0];
            this.options.push(this.builder.getSingleTagNameAndClassNameExpression(this.node.tagName, className));
        }
        if ('DIV' != tagName && 'UL' != tagName)
            this.options.push(this.node.tagName);
    }
    return PathElement;
}());
var PathAnalyzer = (function () {
    function PathAnalyzer(targetNode, builder, rootNode, basePath) {
        this.builder = builder;
        this.targetNode = targetNode;
        this.rootNode = rootNode || document.body;
        this.basePath = basePath || '';
        this.pathList = null;
        this.ancestors = [];
    }
    PathAnalyzer.prototype.createPathList = function () {
        {
            var node = this.targetNode;
            var index = 0;
            while (node) {
                if (this.rootNode == node)
                    break;
                var element_1 = new PathElement(node, index, this.builder);
                this.ancestors.push(element_1);
                node = node.parentNode;
                index++;
            }
        }
        for (var i = 0, l = this.ancestors.length; i < l; i++) {
            var childNode = (i > 0) ? this.ancestors[i - 1] : null;
            var node = this.ancestors[i];
            node.isTarget = (0 == i);
        }
        this.seqList = [];
        this.pathList = [];
        this.uniqPathList = [];
        if (this.ancestors.length > 0)
            this.scan(0, new Array());
        if (this.basePath.length > 0) {
            this.pathList.push(this.builder.createPathFilter(this.basePath));
        }
        for (var i = 0, l = this.uniqPathList.length; i < l; i++) {
            try {
                var path_1 = this.builder.createPathFilter(this.basePath + this.uniqPathList[i]);
                var nested = false;
                for (var elementIndex = 0; elementIndex < path_1.elements.length; elementIndex++) {
                    var element = path_1.elements[elementIndex];
                    if (element != this.targetNode &&
                        (CustomBlockerUtil.isContained(this.targetNode, element) || CustomBlockerUtil.isContained(element, this.targetNode))) {
                        nested = true;
                    }
                }
                if (!nested)
                    this.pathList.push(path_1);
            }
            catch (ex) {
                console.log(ex);
            }
        }
        this.pathList.sort(function (a, b) {
            return (a.elements.length == b.elements.length) ?
                (a.path.length - b.path.length) : (a.elements.length - b.elements.length);
        });
        var list = [];
        var prevPath = null;
        for (var i = 0, l = this.pathList.length; i < l; i++) {
            var path = this.pathList[i];
            if (!prevPath || prevPath.elements.length != path.elements.length) {
                list.push(path);
            }
            prevPath = path;
        }
        return list;
    };
    PathAnalyzer.prototype.scan = function (index, seq) {
        var current = this.ancestors[index];
        for (var i = 0, l = current.options.length; i < l; i++) {
            var cloneSeq = PathAnalyzer.cloneArray(seq);
            var option = current.options[i];
            cloneSeq.push({ path: option, index: index });
            if (cloneSeq.length < PathAnalyzer.SEQ_LIMIT && this.ancestors.length > index + 1)
                this.scan(index + 1, PathAnalyzer.cloneArray(PathAnalyzer.cloneArray(cloneSeq)));
            this.addSeq(cloneSeq);
        }
        if (index > 0 && seq.length < PathAnalyzer.SEQ_LIMIT && this.ancestors.length > index + 1)
            this.scan(index + 1, PathAnalyzer.cloneArray(seq));
        if (this.rootNode == document.body && current.node.id) {
            var cloneSeq = PathAnalyzer.cloneArray(seq);
            cloneSeq.push({ path: this.builder.getIdExpression(current.node.id), index: index, hasId: true });
            this.addSeq(cloneSeq);
        }
    };
    PathAnalyzer.prototype.addSeq = function (seq) {
        var str = '';
        for (var i = 0, l = seq.length; i < l; i++) {
            var next = (i < l - 1) ? seq[i + 1] : null;
            var current = seq[i];
            str = current.path + str;
            if (current.hasId) {
            }
            else if ((next && next.index == current.index + 1) || 'BODY' == current.path)
                str = this.builder.getChildSeparator() + str;
            else
                str = this.builder.getDescendantSeparator() + str;
        }
        if (!CustomBlockerUtil.arrayContains(this.uniqPathList, str))
            this.uniqPathList.push(str);
    };
    PathAnalyzer.cloneArray = function (orig) {
        var array = new Array();
        for (var i = 0, l = orig.length; i < l; i++) {
            array[i] = { path: orig[i].path, index: orig[i].index };
        }
        return array;
    };
    PathAnalyzer.initialize = function () {
        PathAnalyzer.SEQ_LIMIT = 2;
    };
    return PathAnalyzer;
}());
//# sourceMappingURL=path_analyzer.js.map