var RuleExecutor = (function () {
    function RuleExecutor() {
    }
    RuleExecutor.initialize = function () {
        RuleExecutor.blockedCount = 0;
    };
    RuleExecutor.checkRules = function (list) {
        for (var i = 0, l = list.length; i < l; i++) {
            var rule = list[i];
            try {
                var regex;
                if (rule.specify_url_by_regexp) {
                    regex = new RegExp(rule.site_regexp, 'i');
                }
                else {
                    regex = new RegExp(CustomBlockerUtil.wildcardToRegExp(rule.site_regexp), 'i');
                }
                if (regex.test(location.href)) {
                    rules.push(rule);
                }
                else {
                    console.info("Rule is NOT applied." + location.href + "<=>" + rule.site_regexp);
                }
            }
            catch (e) {
                console.log(e);
            }
        }
        window.bgProcessor.sendRequest('setApplied', { list: rules }, 'badge');
        if (rules.length > 0) {
            RuleExecutor.startBlocking();
        }
    };
    RuleExecutor.startBlocking = function () {
        for (var i = 0, l = rules.length; i < l; i++) {
            var rule = rules[i];
            if (rule.block_anyway && !rule.is_disabled) {
                var cssSelector = (rule.hide_block_by_css) ?
                    rule.hide_block_css : CustomBlockerUtil.xpathToCss(rule.hide_block_xpath);
                if (cssSelector != null) {
                    RuleExecutor.addBlockCss(cssSelector);
                    rule.staticXpath = cssSelector;
                }
            }
            for (var j = 0; j < rule.words.length; j++) {
                var word = rule.words[j];
                if (word.is_regexp) {
                    try {
                        if (word.is_complete_matching) {
                            var expression = (word.word.charAt(0) != '^') ? "^" : "";
                            expression += word.word;
                            expression += ((word.word.charAt(word.word.length - 1) != '$') ? '$' : '');
                            if (word.is_case_sensitive) {
                                word.regExp = new RegExp(expression);
                            }
                            else {
                                word.regExp = new RegExp(expression, 'i');
                            }
                        }
                        else {
                            if (word.is_case_sensitive) {
                                word.regExp = new RegExp(word.word);
                            }
                            else {
                                word.regExp = new RegExp(word.word, 'i');
                            }
                        }
                    }
                    catch (ex) {
                        console.log("Invalid RegExp: \"" + word.word + "\"");
                    }
                }
            }
        }
        var needBlocking = false;
        for (var i = 0, l = rules.length; i < l; i++) {
            if (!rules[i].is_disabled)
                needBlocking = true;
        }
        if (needBlocking) {
            for (var after = 50; after < 250; after += 50) {
                setTimeout(RuleExecutor.execBlock, after);
            }
            RuleExecutor.blockInterval = setInterval(RuleExecutor.execBlock, 250);
            RuleExecutor.execBlock();
        }
    };
    RuleExecutor.stopBlocking = function () {
        if (RuleExecutor.blockTimeout) {
            clearTimeout(RuleExecutor.blockTimeout);
        }
        if (RuleExecutor.blockInterval) {
            clearInterval(RuleExecutor.blockInterval);
        }
    };
    RuleExecutor.execBlock = function () {
        if (!rules)
            return;
        var _loop_1 = function (rule) {
            if (!rule.is_disabled) {
                RuleExecutor.applyRule(rule, false, function (node) {
                    hiddenNodeList.add(node);
                    RuleExecutor.blockedCount++;
                    if (!rule.staticXpath) {
                        hiddenNodeList.apply(node);
                    }
                }, false);
            }
        };
        for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
            var rule = rules_1[_i];
            _loop_1(rule);
        }
    };
    RuleExecutor.reloadRules = function () {
        window.bgProcessor.sendRequest('reload', {}, 'reload');
    };
    RuleExecutor.applyRule = function (rule, ignoreHidden, onHide, isTesting) {
        var needRefreshBadge = false;
        var hideNodes = (rule.hide_block_by_css) ?
            CustomBlockerUtil.getElementsByCssSelector(rule.hide_block_css)
            :
                CustomBlockerUtil.getElementsByXPath(rule.hide_block_xpath);
        var searchNodes;
        if ((rule.search_block_by_css && CustomBlockerUtil.isEmpty(rule.search_block_css)) ||
            (!rule.search_block_by_css && CustomBlockerUtil.isEmpty(rule.search_block_xpath))) {
            searchNodes = [];
            for (var i = 0; i < hideNodes.length; i++) {
                searchNodes.push(hideNodes[i]);
            }
        }
        else {
            searchNodes = (rule.block_anyway) ? [] : ((rule.search_block_by_css) ?
                CustomBlockerUtil.getElementsByCssSelector(rule.search_block_css)
                :
                    CustomBlockerUtil.getElementsByXPath(rule.search_block_xpath));
        }
        for (var _i = 0, searchNodes_1 = searchNodes; _i < searchNodes_1.length; _i++) {
            var node_1 = searchNodes_1[_i];
            if (node_1.getAttribute("containsNgWord")) {
                continue;
            }
            var foundWord = RuleExecutor.nodeContains(node_1, rule.words);
            if (foundWord != null) {
                node_1.containsNgWord = true;
                node_1.setAttribute("containsNgWord", true);
                node_1.setAttribute("foundWord", foundWord.word_id);
            }
        }
        for (var i = 0, l = hideNodes.length; i < l; i++) {
            var node = hideNodes[i];
            if (node.style.display == "none") {
                continue;
            }
            var shouldBeHidden = rule.block_anyway;
            var foundChild = null;
            if (!shouldBeHidden) {
                foundChild = RuleExecutor.findFlaggedChild(node, searchNodes);
                if (foundChild) {
                    shouldBeHidden = true;
                }
            }
            if ((ignoreHidden || !node.hideDone) && shouldBeHidden) {
                if (!node.defaultStyles) {
                    node.defaultStyles = {
                        backgroundColor: node.style.backgroundColor,
                        display: node.style.display
                    };
                }
                node.hideDone = true;
                needRefreshBadge = true;
                rule.hiddenCount = (rule.hiddenCount) ? rule.hiddenCount + 1 : 1;
                if (foundChild) {
                    if (!rule.appliedWords) {
                        rule.appliedWords = [];
                    }
                    var wordId = parseInt(foundChild.getAttribute("foundWord"));
                    rule.appliedWords[wordId] = (rule.appliedWords[wordId] > 0) ? rule.appliedWords[wordId] + 1 : 1;
                }
                if (onHide) {
                    onHide(node);
                }
            }
            else if (isTesting && node.hideDone && !shouldBeHidden) {
                if (node.defaultStyles) {
                    node.style.backgroundColor = node.defaultStyles.backgroundColor;
                    node.style.display = node.defaultStyles.display;
                }
            }
        }
        for (var _a = 0, searchNodes_2 = searchNodes; _a < searchNodes_2.length; _a++) {
            node = searchNodes_2[_a];
            node.containsNgWord = false;
        }
        if (needRefreshBadge && RuleExecutor.blockedCount > 0) {
            window.bgProcessor.sendRequest('badge', { rules: rules, count: RuleExecutor.blockedCount }, 'badge');
        }
    };
    RuleExecutor.findFlaggedChild = function (hideNode, list) {
        for (var i = 0, l = list.length; i < l; i++) {
            if (!list[i].getAttribute("containsNgWord")) {
                continue;
            }
            if (RuleExecutor.containsAsChild(hideNode, list[i])) {
                return list[i];
            }
        }
        return null;
    };
    RuleExecutor.containsAsChild = function (rootNode, _node) {
        var node = _node;
        while (node) {
            if (node == rootNode)
                return true;
            node = node.parentNode;
        }
        return false;
    };
    RuleExecutor.nodeContains = function (node, words) {
        try {
            var _text = node.textContent;
            if (!(_text.length > 0)) {
                return null;
            }
            for (var i = 0, l = words.length; i < l; i++) {
                var word = words[i];
                if (!word.checkedNodes) {
                    word.checkedNodes = new Array();
                }
                if (CustomBlockerUtil.arrayContains(word.checkedNodes, node)) {
                    continue;
                }
                word.checkedNodes.push(node);
                if (word.is_include_href) {
                    var links = new Array();
                    if (node.tagName == 'A') {
                        links.push(node);
                    }
                    var innerLinks = node.getElementsByTagName("A");
                    for (var j = 0; j < innerLinks.length; j++) {
                        links.push(innerLinks[j]);
                    }
                    for (var j = 0; j < links.length; j++) {
                        var url = links[j].href;
                        if (url) {
                            _text += (" " + url);
                        }
                    }
                }
                var text = (word.is_case_sensitive) ? _text : _text.toLowerCase();
                var w = (word.is_case_sensitive) ? word.word : word.word.toLowerCase();
                if (word.deleted) {
                    continue;
                }
                if (word.is_regexp) {
                    if (word.regExp && word.regExp.test(text)) {
                        return word;
                    }
                }
                else {
                    if (word.is_complete_matching) {
                        if (text == w) {
                            return word;
                        }
                    }
                    else {
                        if (text.indexOf(w) > -1) {
                            return word;
                        }
                    }
                }
            }
        }
        catch (ex) {
            console.log("RuleEx ERROR");
            console.log(ex);
            return null;
        }
        return null;
    };
    RuleExecutor.addBlockCss = function (xpath) {
        if (RuleExecutor.styleTag == null) {
            RuleExecutor.styleTag = document.createElement('STYLE');
            RuleExecutor.styleTag.type = 'text/css';
            document.getElementsByTagName('HEAD')[0].appendChild(RuleExecutor.styleTag);
        }
        RuleExecutor.styleTag.innerHTML = RuleExecutor.styleTag.innerHTML + (xpath + '{display:none;}');
    };
    return RuleExecutor;
}());
RuleExecutor.initialize();
var rules;
var StyleProcessor = (function () {
    function StyleProcessor(attribute, attributeJs, value) {
        this.attribute = attribute;
        this.attributeJs = attributeJs;
        this.value = value;
        this.nodes = [];
    }
    StyleProcessor.prototype.add = function (node) {
        if (CustomBlockerUtil.arrayContains(this.nodes, node)) {
            return;
        }
        var origValue = getComputedStyle(node, null).getPropertyValue(this.attribute);
        this.nodes.push({ node: node, origValue: origValue });
    };
    StyleProcessor.prototype.apply = function (node) {
        node.style[this.attributeJs] = this.value;
    };
    StyleProcessor.prototype.applyStyles = function () {
        for (var i = 0, l = this.nodes.length; i < l; i++) {
            this.nodes[i].node.style[this.attributeJs] = this.value;
        }
    };
    StyleProcessor.prototype.restoreStyles = function () {
        for (var i = 0, l = this.nodes.length; i < l; i++) {
            this.nodes[i].node.style[this.attributeJs] = this.nodes[i].origValue;
        }
    };
    return StyleProcessor;
}());
var hiddenNodeList = new StyleProcessor("display", "display", "none");
var testNodeList = new StyleProcessor("background-color", "backgroundColor", "#888");
//# sourceMappingURL=rule_executor.js.map