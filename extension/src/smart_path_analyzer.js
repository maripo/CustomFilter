var SmartPathAnalyzer = (function () {
    function SmartPathAnalyzer(_node, builder, appliedRuleList) {
        this._node = _node;
        this.builder = builder;
        this.appliedRuleList = appliedRuleList;
    }
    SmartPathAnalyzer.prototype.createPathList = function () {
        this.addedHidePaths = [];
        this.addedSearchPaths = [];
        var hideOriginalNode = this._node;
        var pathList = [];
        while (hideOriginalNode) {
            var siblings = CustomBlockerUtil.getSimilarSiblings(hideOriginalNode);
            if (siblings.length > 0) {
                this.analyzerHideNode(hideOriginalNode, this._node, pathList);
            }
            hideOriginalNode = hideOriginalNode.parentNode;
        }
        return pathList;
    };
    SmartPathAnalyzer.prototype.analyzerHideNode = function (hideOriginalNode, originalNode, pathList) {
        var hidePathSelectors = new PathAnalyzer(hideOriginalNode, this.builder, null, null).createPathList();
        for (var i = hidePathSelectors.length - 1; i >= 0; i--) {
            var hidePathSelector = hidePathSelectors[i];
            if (CustomBlockerUtil.arrayContains(this.addedHidePaths, hidePathSelector.path)) {
                continue;
            }
            this.addedHidePaths.push(hidePathSelector.path);
            var hideElements = hidePathSelector.elements;
            var siblingFound = false;
            for (var hideIndex = 0; hideIndex < hideElements.length; hideIndex++) {
                if (hideElements[hideIndex] != hideOriginalNode && hideElements[hideIndex].parentNode == hideOriginalNode.parentNode) {
                    siblingFound = true;
                }
            }
            if (hideElements.length > 1 && siblingFound) {
                var searchOriginalNode = originalNode;
                while (CustomBlockerUtil.isContained(searchOriginalNode, hideOriginalNode)) {
                    var searchPathSelectors = new PathAnalyzer(searchOriginalNode, this.builder, hideOriginalNode, hidePathSelector.path).createPathList();
                    for (var searchIndex = 0; searchIndex < searchPathSelectors.length; searchIndex++) {
                        var searchPathSelector = searchPathSelectors[searchIndex];
                        if (CustomBlockerUtil.arrayContains(this.addedSearchPaths, searchPathSelector.path)) {
                            continue;
                        }
                        if (this.isIncludedInAppliedRules(hidePathSelector, searchPathSelector)) {
                            continue;
                        }
                        this.addedSearchPaths.push(searchPathSelector.path);
                        var searchSelectedNodes = searchPathSelector.elements;
                        var searchElements = searchPathSelector.elements;
                        var containedNode = CustomBlockerUtil.getContainedElements(hideElements, searchElements);
                        if (containedNode.length > 1) {
                            pathList.push(new SmartPath(hidePathSelector, searchPathSelector));
                        }
                    }
                    searchOriginalNode = searchOriginalNode.parentNode;
                }
            }
        }
    };
    SmartPathAnalyzer.prototype.isIncludedInAppliedRules = function (hidePathSelector, searchPathSelector) {
        if (!this.appliedRuleList) {
            return false;
        }
        for (var _i = 0, _a = this.appliedRuleList; _i < _a.length; _i++) {
            var rule = _a[_i];
            if (CustomBlockerUtil.arrayEquals(hidePathSelector.elements, rule.hideNodes) &&
                CustomBlockerUtil.arrayEquals(searchPathSelector.elements, rule.searchNodes)) {
                return true;
            }
        }
        return false;
    };
    return SmartPathAnalyzer;
}());
var pathCount = 0;
var SmartPath = (function () {
    function SmartPath(hidePath, searchPath) {
        this.hidePath = hidePath;
        this.searchPath = searchPath;
    }
    return SmartPath;
}());
//# sourceMappingURL=smart_path_analyzer.js.map