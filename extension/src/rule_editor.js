var selectedNode = null;
var origStyle = null;
var origHref = null;
var RuleEditor = (function () {
    function RuleEditor() {
        this.getOnMousedownAction = function () {
            var self = this;
            return function (event) {
                self.moving = true;
                self.origEventX = event.pageX;
                self.origEventY = event.pageY;
                self.origDivX = parseInt(self.frameContainer.style.right.replace('px', ''));
                self.origDivY = parseInt(self.frameContainer.style.top.replace('px', ''));
            };
        };
        this.getOnMouseupAction = function () {
            var self = this;
            return function (event) {
                if (self.moving) {
                    self.moving = false;
                }
                else {
                    self.processSelection(event);
                }
            };
        };
    }
    RuleEditor.prototype.initialize = function (rule, appliedRuleList) {
        this.pathPickerEventHandlers = new Array(0);
        this.rule = rule;
        if (!this.rule) {
            this.rule = cbStorage.createRule();
            this.rule.title = document.title;
            this.rule.site_regexp = location.href;
            this.rule.example_url = location.href;
        }
        this.appliedRuleList = appliedRuleList;
        this.maxZIndex = 0;
        var nodes = document.body.getElementsByTagName('*');
        this.maxZIndex = RuleEditor.getMaxZIndex();
        RuleExecutor.stopBlocking();
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node.getAttribute("avoidStyle")) {
                continue;
            }
            var mouseoverHandler = this.getOnMouseoverActionForFrame(node);
            var mouseoutHandler = this.getOnMouseoutActionForFrame(node);
            var clickHandler = this.getOnClickActionForFrame(node, null);
            node.addEventListener('mouseover', mouseoverHandler, false);
            node.addEventListener('mouseout', mouseoutHandler, false);
            node.addEventListener('click', clickHandler, false);
            this.pathPickerEventHandlers.push({
                node: node,
                mouseoverHandler: mouseoverHandler,
                mouseoutHandler: mouseoutHandler,
                clickHandler: clickHandler
            });
            RuleElement.appendFunctions(node);
        }
        CustomBlockerUtil.applyCss('/css/reset.css');
        CustomBlockerUtil.applyCss('/css/rule_editor.css');
        CustomBlockerUtil.applyCss('/css/rule_editor_common.css');
        CustomBlockerUtil.applyCss('/css/keywords.css');
        CustomBlockerUtil.applyCss('/css/rule_editor_cursor.css');
        if (!this.pathPickerDialog) {
            this.pathPickerDialog = new PathPickerDialog(this.maxZIndex + 2, this);
        }
        CustomBlockerUtil.enableFlashZIndex();
        this.openFrame();
    };
    RuleEditor.prototype.hideCover = function () {
        window.elementHighlighter.highlightHideElements(null);
    };
    RuleEditor.prototype.removePathPickerEventHandlers = function () {
        if (!this.pathPickerEventHandlers)
            return;
        for (var _i = 0, _a = this.pathPickerEventHandlers; _i < _a.length; _i++) {
            var obj = _a[_i];
            obj.node.removeEventListener('mouseover', obj.mouseoverHandler);
            obj.node.removeEventListener('mouseout', obj.mouseoutHandler);
            obj.node.removeEventListener('click', obj.clickHandler);
        }
    };
    RuleEditor.prototype.pickPath = function (data) {
        window.elementHighlighter.highlightHideElements(null);
        this.hideCover();
        var target = data.target;
        switch (target) {
            case "search_xpath":
                this.pathPickerTarget = PathPickerDialog.targetSearchXpath;
                break;
            case "search_css":
                this.pathPickerTarget = PathPickerDialog.targetSearchCss;
                break;
            case "hide_xpath":
                this.pathPickerTarget = PathPickerDialog.targetHideXpath;
                break;
            case "hide_css":
                this.pathPickerTarget = PathPickerDialog.targetHideCss;
                break;
        }
        this.pathPickerTarget.label = target;
    };
    RuleEditor.prototype.sendRuleToFrame = function () {
        this.iframe.contentWindow.postMessage({
            command: 'customblocker_set_rule',
            url: location.href,
            title: document.title,
            rule: this.rule
        }, "*");
    };
    RuleEditor.prototype.handleReceivedMessage = function (data) {
        switch (data.command) {
            case "customblocker_frame_ready": {
                this.sendRuleToFrame();
                break;
            }
            case "customblocker_save_rule": {
                console.log("customblocker_save_rule");
                var scope_1 = this;
                cbStorage.saveRule(data.rule, function () {
                    window.bgCommunicator.sendRequest('notifyUpdate', { dbCommand: 'save', type: 'rule', obj: data.rule });
                    scope_1.onSaveDone(data.rule);
                });
                break;
            }
            case "customblocker_test_rule": {
                var rule = data.rule;
                hiddenNodeList.restoreStyles();
                if (RuleExecutor.styleTag) {
                    RuleExecutor.styleTag.parentNode.removeChild(RuleExecutor.styleTag);
                }
                RuleExecutor.applyRule(rule, true, function (node) {
                    testNodeList.add(node);
                    testNodeList.apply(node);
                }, true);
                break;
            }
            case "customblocker_pick_path": {
                this.pickPath(data);
                break;
            }
            case "customblocker_validate_selectors": {
                this.validateSelectors(data);
                break;
            }
            case "customblocker_close": {
                this.closeFrame();
                break;
            }
            case "customblocker_resize": {
                this.iframe.style.height = data.height + "px";
                break;
            }
        }
    };
    RuleEditor.prototype.closeFrame = function () {
        this.frameContainer.style.display = 'none';
        this.pathPickerDialog.close();
        this.pathPickerDialog.deselectAllTargets();
        this.removePathPickerEventHandlers();
        window.elementHighlighter.highlightRule(null);
        CustomBlockerUtil.removeCss('/css/rule_editor_cursor.css');
        testNodeList.restoreStyles();
        hiddenNodeList.applyStyles();
    };
    RuleEditor.prototype.validateSelector = function (selectorType, isSearch, selector) {
        try {
            var pathNodes;
            if (selectorType == "css") {
                pathNodes = (selector != '') ? CustomBlockerUtil.getElementsByCssSelector(selector) : [];
            }
            else {
                pathNodes = (selector != '') ? CustomBlockerUtil.getElementsByXPath(selector) : [];
            }
            return { isValid: true, nodes: pathNodes };
        }
        catch (e) {
            console.log(e);
            return { isValid: false, nodes: [] };
        }
    };
    RuleEditor.prototype.validateSelectors = function (data) {
        var hideResult = this.validateSelector(data.hide_type, false, data.hide_selector);
        if (hideResult.isValid) {
            window.elementHighlighter.highlightHideElements(hideResult.nodes);
        }
        var searchResult = this.validateSelector(data.search_type, false, data.search_selector);
        if (searchResult.isValid) {
            window.elementHighlighter.highlightSearchElements(searchResult.nodes);
        }
        var options = { command: 'customblocker_validate_selectors_result',
            hideType: data.hide_type,
            hideValid: hideResult.isValid,
            hideCount: hideResult.nodes.length,
            searchType: data.search_type,
            searchValid: searchResult.isValid,
            searchCount: searchResult.nodes.length
        };
        this.iframe.contentWindow.postMessage(options, "*");
    };
    RuleEditor.prototype.getReceiveMessageFunc = function () {
        var self = this;
        return function (event) {
            if (!(event.origin.indexOf(chrome.runtime.id) >= 0)) {
                return;
            }
            self.handleReceivedMessage(event.data);
        };
    };
    RuleEditor.prototype.getOnMousemoveAction = function () {
        var self = this;
        return function (event) {
            if (!self.moving)
                return;
            self.frameContainer.style.right = (self.origDivX - (event.pageX - self.origEventX)) + 'px';
            self.frameContainer.style.top = (self.origDivY + (event.pageY - self.origEventY)) + 'px';
        };
    };
    RuleEditor.prototype.processSelection = function (event) {
        if (null == document.getSelection())
            return;
        if (document.getElementById('rule_editor_keyword') == event.srcElement)
            return;
    };
    RuleEditor.getMaxZIndex = function () {
        var max = 1;
        var elements = document.getElementsByTagName('*');
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var style = window.getComputedStyle(element);
            if (style && style.zIndex && 'auto' != style.zIndex && parseInt(style.zIndex) > max) {
                max = parseInt(style.zIndex);
            }
        }
        return max;
    };
    RuleEditor.prototype.openFrame = function () {
        if (this.frameContainer) {
            this.frameContainer.style.display = "block";
            this.sendRuleToFrame();
            return;
        }
        var frameContainer = document.createElement("DIV");
        frameContainer.style.position = "fixed";
        frameContainer.style.zIndex = (this.maxZIndex + 1).toString();
        frameContainer.style.width = '400px';
        frameContainer.style.top = '10px';
        frameContainer.style.right = '10px';
        frameContainer.style.backgroundColor = '#fff';
        frameContainer.style.border = '1px solid #888';
        frameContainer.style.boxShadow = "0px 1px 1px rgba(0,0,0,0.5)";
        var iframe = document.createElement("IFRAME");
        iframe.setAttribute("src", chrome.extension.getURL(chrome.i18n.getMessage('extLocale') + '/rule_editor_frame.html'));
        iframe.setAttribute("scrolling", "no");
        iframe.setAttribute("frameborder", "0");
        iframe.style.width = '400px';
        iframe.style.height = '640px';
        iframe.style.border = 'none';
        var dragger = document.createElement("DIV");
        dragger.addEventListener('mousedown', this.getOnMousedownAction(), false);
        document.body.addEventListener('mousemove', this.getOnMousemoveAction(), false);
        document.body.addEventListener('mouseup', this.getOnMouseupAction(), false);
        dragger.style.backgroundColor = "#fff";
        dragger.style.height = "18px";
        dragger.style.width = "100%";
        dragger.style.display = "block";
        dragger.style.textAlign = "right";
        dragger.style.cursor = "move";
        var scope = this;
        var closeIcon = document.createElement("A");
        closeIcon.style.backgroundImage = "url(" + chrome.extension.getURL("/img/rule_editor_close.png") + ")";
        closeIcon.style.backgroundRepeat = "no-repeat";
        closeIcon.style.backgroundPosition = "2px 2px";
        closeIcon.style.backgroundSize = "14px 14px";
        closeIcon.style.display = "block";
        closeIcon.style.width = "22px";
        closeIcon.style.height = "18px";
        closeIcon.style.marginTop = "4px";
        closeIcon.style.cssFloat = "right";
        closeIcon.setAttribute("href", "javascript:void(0)");
        closeIcon.addEventListener("click", function () { scope.closeFrame(); }, false);
        dragger.appendChild(closeIcon);
        dragger.setAttribute("avoidStyle", "true");
        frameContainer.setAttribute("avoidStyle", "true");
        iframe.setAttribute("avoidStyle", "true");
        closeIcon.setAttribute("avoidStyle", "true");
        frameContainer.appendChild(dragger);
        frameContainer.appendChild(iframe);
        document.body.appendChild(frameContainer);
        this.iframe = iframe;
        this.frameContainer = frameContainer;
        window.addEventListener("message", this.getReceiveMessageFunc(), false);
    };
    RuleEditor.prototype.onSaveDone = function (rule) {
        this.rule.rule_id = rule.rule_id;
        var options = { command: 'customblocker_rule_saved',
            rule: rule
        };
        this.iframe.contentWindow.postMessage(options, "*");
    };
    RuleEditor.prototype.getOnClickActionForFrame = function (node, origEvent) {
        var self = this;
        return function (event) {
            self.openPathPicker((origEvent || event), node);
        };
    };
    RuleEditor.prototype.openPathPicker = function (event, node) {
        if (!window.ruleEditor || !this.pathPickerTarget || this.pathPickerTarget.none) {
            console.log("openPathPicker return. ruleEditor=" + window.ruleEditor
                + ", pathPickerTarget=" + this.pathPickerTarget);
            return;
        }
        var scope = this;
        if (selectedNode == node) {
            var analyzer = new PathAnalyzer(node, this.pathPickerTarget.getPathBuilder(), null, null);
            var paths = analyzer.createPathList();
            var upper = node.parentNode;
            var upperNodeHandlers = {
                mouseover: this.getOnMouseoverActionForFrame(upper),
                mouseout: this.getOnMouseoutActionForFrame(upper),
                click: this.getOnClickActionForFrame(upper, event)
            };
            console.log("Calling this.pathPickerDialog.show()");
            this.pathPickerDialog.show(event, node, paths, this.pathPickerTarget, upperNodeHandlers, function (target, path) {
                var options = {
                    command: "customblocker_path_picked",
                    target: target,
                    path: path
                };
                scope.iframe.contentWindow.postMessage(options, "*");
            });
        }
        event.stopPropagation();
        event.preventDefault();
    };
    RuleEditor.prototype.focusNode = function (node) {
        var self = this;
        selectedNode = node;
        origStyle = selectedNode.style.outline;
        origHref = selectedNode.getAttribute("href");
        selectedNode.href = 'javascript:void(0)';
        if (self.pathPickerTarget.none && selectedNode.unfocus) {
            selectedNode.unfocus();
        }
        else if (self.pathPickerTarget.isToHide && selectedNode.focusForSearch) {
            selectedNode.focusForHide();
        }
        else if (self.pathPickerTarget.isToSearch && selectedNode.focusForHide) {
            selectedNode.focusForSearch();
        }
    };
    RuleEditor.prototype.getOnMouseoverActionForFrame = function (node) {
        var self = this;
        return function (event) {
            if (selectedNode) {
                self.unfocusNode(selectedNode);
            }
            if (window.ruleEditor && self.pathPickerTarget) {
                self.focusNode(node);
            }
            event.stopPropagation();
            event.preventDefault();
        };
    };
    RuleEditor.prototype.unfocusNode = function (node) {
        if (window.ruleEditor && selectedNode) {
            selectedNode.style.outline = origStyle;
            selectedNode.href = origHref;
        }
        selectedNode = null;
    };
    RuleEditor.prototype.getOnMouseoutActionForFrame = function (node) {
        var scope = this;
        return function (event) {
            scope.unfocusNode(node);
        };
    };
    return RuleEditor;
}());
var PathPickerDialog = (function () {
    function PathPickerDialog(_zIndex, ruleEditor) {
        this.ruleEditor = ruleEditor;
        this.div = document.createElement('DIV');
        this.div.id = 'xpath_picker_body';
        this.div.setAttribute("avoidStyle", "true");
        this.div.style.display = 'none';
        this.div.style.backgroundColor = 'white';
        this.div.style.zIndex = _zIndex.toString();
        this.div.style.fontSize = 'small';
        this.div.style.textAlign = 'left';
        this.div.style.position = 'absolute';
        this.div.style.padding = '4px';
        this.div.style.color = 'black';
        this.ul = document.createElement('UL');
        this.ul.setAttribute("avoidStyle", "true");
        this.div.appendChild(this.ul);
        document.body.appendChild(this.div);
        this.currentSearchFilter = null;
        this.currentHideFilter = null;
        this.currentFilter = null;
    }
    PathPickerDialog.prototype.show = function (event, originNode, paths, target, uppseNodeHandlers, onSelect) {
        this.ul.innerHTML = '';
        if (originNode.parentNode && originNode.parentNode != document.body) {
            var li = document.createElement("LI");
            li.className = "upper";
            var a = document.createElement("A");
            a.innerHTML = chrome.i18n.getMessage('selectOuterElement');
            a.addEventListener('click', uppseNodeHandlers.click, false);
            a.addEventListener('mouseover', uppseNodeHandlers.mouseover, false);
            a.addEventListener('mouseout', uppseNodeHandlers.mouseout, false);
            li.appendChild(a);
            this.ul.appendChild(li);
        }
        for (var i = 0, l = paths.length; i < l; i++) {
            var li = document.createElement('LI');
            li.setAttribute("avoidStyle", "true");
            var a = document.createElement('A');
            a.setAttribute("avoidStyle", "true");
            a.setAttribute("href", 'javascript:void(0)');
            var span = document.createElement('SPAN');
            span.className = 'xpath';
            span.innerHTML = CustomBlockerUtil.escapeHTML(CustomBlockerUtil.trim(paths[i].path));
            var badge = document.createElement('SPAN');
            badge.className = 'badge';
            badge.innerHTML = paths[i].elements.length;
            a.appendChild(badge);
            a.appendChild(span);
            a.addEventListener('click', this.getOnclickAction(paths[i], target, onSelect), false);
            a.addEventListener('mouseover', this.getOnmouseoverAction(paths[i], target), false);
            li.appendChild(a);
            this.ul.appendChild(li);
        }
        this.div.style.display = 'block';
        console.log("PathPicker content = " + this.div.innerHTML);
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
        var _left = event.clientX + scrollLeft;
        var _top = event.clientY + scrollTop;
        if (_left + this.div.clientWidth > scrollLeft + window.innerWidth) {
            _left = scrollLeft + window.innerWidth - this.div.clientWidth;
        }
        if (_top + this.div.clientHeight > scrollTop + window.innerHeight) {
            _top = scrollTop + window.innerHeight - this.div.clientHeight;
        }
        this.div.style.left = _left + 'px';
        this.div.style.top = _top + 'px';
        var currentFilter = (target.isToHide) ? self.currentHideFilter : self.currentSearchFilter;
        if (this.currentFilter != currentFilter) {
            var elements = this.currentFilter.elements;
            for (var i = 0, l = elements.length; i < l; i++) {
                if (elements[i].tmpUnselect)
                    elements[i].tmpUnselect();
            }
        }
    };
    PathPickerDialog.prototype.deselectFilterTargets = function (filter) {
        if (!filter)
            return;
        var elements = filter.elements;
        for (var i = 0, l = elements.length; i < l; i++) {
            if (!elements[i].getAttribute("avoidStyle")) {
                elements[i].style.outline = '';
            }
        }
    };
    PathPickerDialog.prototype.deselectAllTargets = function () {
        this.deselectFilterTargets(this.currentHideFilter);
        this.deselectFilterTargets(this.currentSearchFilter);
    };
    PathPickerDialog.prototype.getOnmouseoverAction = function (filter, target) {
        var self = this;
        return function (event) {
            var currentFilter = (target.isToHide) ? self.currentHideFilter : self.currentSearchFilter;
            if (currentFilter) {
                self.deselectFilterTargets(currentFilter);
            }
            try {
                var pathNodes = target.getPathNodes(filter.path);
                for (var i = 0; i < pathNodes.length; i++) {
                    if (pathNodes[i] != selectedNode && !pathNodes[i].getAttribute("avoidStyle") && pathNodes[i].tmpSelectForHide) {
                        if (target.isToHide)
                            pathNodes[i].tmpSelectForHide();
                        else
                            pathNodes[i].tmpSelectForSearch();
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
            if (target.isToHide)
                self.currentHideFilter = filter;
            else
                self.currentSearchFilter = filter;
            self.currentFilter = filter;
        };
    };
    PathPickerDialog.prototype.close = function () {
        if (this.div) {
            this.div.style.display = 'none';
        }
    };
    PathPickerDialog.prototype.getOnclickAction = function (filter, target, onSelect) {
        var self = this;
        return function (event) {
            var currentFilter = (target.isToHide) ? self.currentHideFilter : self.currentHideFilter;
            var path = CustomBlockerUtil.trim(filter.path);
            if (onSelect) {
                onSelect(target.label, path);
            }
            if (target.isToHide)
                self.currentHideFilter = filter;
            else
                self.currentSearchFilter = filter;
            self.currentFilter = filter;
            self.close();
        };
    };
    PathPickerDialog.initializeTargets = function () {
        PathPickerDialog.targetNone = {
            none: true,
            isToHide: false,
            isToSearch: false,
            textboxId: 'rule_editor_hide_block_xpath',
            label: null
        };
        PathPickerDialog.targetHideXpath = {
            none: false,
            isToHide: true,
            isToSearch: false,
            textboxId: 'rule_editor_hide_block_xpath',
            getPathBuilder: function () { return new XpathBuilder(); },
            getPathNodes: function (path) { return CustomBlockerUtil.getElementsByXPath(path); },
            label: null
        };
        PathPickerDialog.targetHideCss = {
            none: false,
            isToHide: true,
            isToSearch: false,
            textboxId: 'rule_editor_hide_block_css',
            getPathBuilder: function () { return new CssBuilder(); },
            getPathNodes: function (path) { return CustomBlockerUtil.getElementsByCssSelector(path); },
            label: null
        };
        PathPickerDialog.targetSearchXpath = {
            none: false,
            isToHide: false,
            isToSearch: true,
            textboxId: 'rule_editor_search_block_xpath',
            getPathBuilder: function () { return new XpathBuilder(); },
            getPathNodes: function (path) { return CustomBlockerUtil.getElementsByXPath(path); },
            label: null
        };
        PathPickerDialog.targetSearchCss = {
            none: false,
            isToHide: false,
            isToSearch: true,
            textboxId: 'rule_editor_search_block_css',
            getPathBuilder: function () { return new CssBuilder(); },
            getPathNodes: function (path) { return CustomBlockerUtil.getElementsByCssSelector(path); },
            label: null
        };
    };
    return PathPickerDialog;
}());
PathPickerDialog.initializeTargets();
var RuleElement = (function () {
    function RuleElement() {
    }
    RuleElement.appendFunctions = function (element) {
        element.isTmpSelectedForHide = false;
        element.isTmpSelectedForSearch = false;
        element.isSelectedForHide = false;
        element.isSelectedForSearch = false;
        element.focusForHide = RuleElement.getFocusForHideFunc(element);
        element.focusForSearch = RuleElement.getFocusForSearchFunc(element);
        element.unfocus = RuleElement.getUnfocusFunc(element);
        element.tmpSelectForHide = RuleElement.getTmpSelectForHideFunc(element);
        element.tmpSelectForSearch = RuleElement.getTmpSelectForSearchFunc(element);
        element.tmpUnselect = RuleElement.getTmpUnselectFunc(element);
    };
    RuleElement.getFocusForHideFunc = function (element) {
        return function (event) {
            element.style.outline = ElementHighlighter.STYLE_FOCUS_FOR_HIDE;
        };
    };
    RuleElement.getFocusForSearchFunc = function (element) {
        return function (event) {
            if (null == element.originalStyle)
                element.originalStyle = (null != element.style.outline) ? element.style.outline : "";
            element.style.outline = ElementHighlighter.STYLE_FOCUS_FOR_SEARCH;
        };
    };
    RuleElement.getUnfocusFunc = function (element) {
        return function () {
            if (element.isSelectedForHide)
                element.style.outline = ElementHighlighter.STYLE_SELECT_FOR_HIDE;
            else if (element.isSelectedForSearch)
                element.style.outline = ElementHighlighter.STYLE_SELECT_FOR_SEARCH;
            selectedNode.style.outline = element.originalStyle;
        };
    };
    RuleElement.getTmpSelectForHideFunc = function (element) {
        return function (event) {
            if (null == element.originalStyle)
                element.originalStyle = (null != element.style.outline) ? element.style.outline : "";
            element.isTmpSelectedForHide = true;
            element.style.outline = ElementHighlighter.STYLE_TMP_SELECT_FOR_HIDE;
        };
    };
    RuleElement.getTmpSelectForSearchFunc = function (element) {
        return function (event) {
            if (null == element.originalStyle)
                element.originalStyle = (null != element.style.outline) ? element.style.outline : "";
            element.isTmpSelectedForSearch = true;
            element.style.outline = ElementHighlighter.STYLE_TMP_SELECT_FOR_SEARCH;
        };
    };
    RuleElement.getTmpUnselectFunc = function (element) {
        return function (event) {
            element.isTmpSelectedForHide = false;
            element.isTmpSelectedForSearch = false;
            if (element.isSelectedForHide)
                element.style.outline = ElementHighlighter.STYLE_SELECT_FOR_HIDE;
            else if (element.isSelectedForSearch)
                element.style.outline = ElementHighlighter.STYLE_SELECT_FOR_SEARCH;
            element.style.outline = element.originalStyle;
        };
    };
    return RuleElement;
}());
//# sourceMappingURL=rule_editor.js.map