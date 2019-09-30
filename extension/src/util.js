var KEY_CODE_RETURN = 13;
var REGEX_WILDCARD_TO_REGEXP = new RegExp('([^A-Za-z0-9_\\*])', 'g');
var REGEX_WILDCARD = new RegExp('\\*', 'g');
var REGEX_DOUBLE_SLASH = new RegExp('//', 'g');
var REGEX_SLASH = new RegExp('/', 'g');
var REGEX_SINGLE_CLASS_NAME = new RegExp('\\[@class=[\'\"](.*?)[\'\"]\\]', 'g');
var REGEX_MULTIPLE_CLASS_NAME = new RegExp('\\[contains\\(concat\\([\'\"] [\'\"],normalize-space\\(@class\\),[\'\"] [\'\"]\\),[\'\"](.*?)[\'\"]\\)\\]', 'g');
var REGEX_ID = new RegExp('id\\([\'\"](.*?)[\'\"]\\)', 'g');
var REGEX_FAIL = new RegExp('.*[\\[\\]\\(\\)\"\'].*');
var CustomBlockerUtil = (function () {
    function CustomBlockerUtil() {
    }
    CustomBlockerUtil.initialize = function () {
        CustomBlockerUtil.regExpAmp = new RegExp('&', 'g');
        CustomBlockerUtil.regExpLt = new RegExp('<', 'g');
        CustomBlockerUtil.regExpGt = new RegExp('>', 'g');
        CustomBlockerUtil.WIDTH_PER_LETTER = 10;
        CustomBlockerUtil.LOCALIZE_CLASS_REGEXP = new RegExp('custom_filter_localize_([^ ]+)');
        CustomBlockerUtil.REGEX_FILE_NAME = new RegExp('/([a-zA-Z0-9_]+\.html)$');
        CustomBlockerUtil.CSS_CLASS = "customblocker-css";
    };
    CustomBlockerUtil.escapeHTML = function (str) {
        return str
            .replace(CustomBlockerUtil.regExpAmp, '&amp;')
            .replace(CustomBlockerUtil.regExpGt, '&gt;')
            .replace(CustomBlockerUtil.regExpLt, '&lt');
    };
    CustomBlockerUtil.getElementsByXPath = function (xpath) {
        var list = new Array();
        try {
            var result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
            var node;
            while (node = result.iterateNext()) {
                list.push(node);
            }
        }
        catch (ex) {
            console.log(ex);
        }
        return list;
    };
    CustomBlockerUtil.getElementsByCssSelector = function (selector) {
        try {
            var list = document.querySelectorAll(selector);
            return (list) ? list : new Array();
        }
        catch (ex) {
            return new Array();
        }
    };
    CustomBlockerUtil.wildcardToRegExp = function (str) {
        var result = ".*"
            + str.replace(REGEX_WILDCARD_TO_REGEXP, '\\$1').replace(REGEX_WILDCARD, '.*')
            + ".*";
        return result;
    };
    CustomBlockerUtil.xpathToCss = function (str) {
        var xpath = str;
        xpath = xpath.replace(REGEX_ID, "#$1");
        xpath = xpath.replace(REGEX_SINGLE_CLASS_NAME, ".$1");
        xpath = xpath.replace(REGEX_MULTIPLE_CLASS_NAME, ".$1");
        xpath = xpath.replace(REGEX_DOUBLE_SLASH, ' ');
        xpath = xpath.replace(REGEX_SLASH, '>');
        if (REGEX_FAIL.test(xpath))
            return null;
        return xpath;
    };
    CustomBlockerUtil.shorten = function (text, limit) {
        var span = document.createElement('SPAN');
        span.style.fontSize = (CustomBlockerUtil.WIDTH_PER_LETTER * 2) + 'px';
        var resultText = text;
        document.body.appendChild(span);
        span.innerHTML = CustomBlockerUtil.escapeHTML(resultText);
        if (span.offsetWidth > limit * CustomBlockerUtil.WIDTH_PER_LETTER) {
            for (var length = text.length; length > 0; length--) {
                var str = text.substring(0, length) + '...';
                span.innerHTML = span.innerHTML = CustomBlockerUtil.escapeHTML(str);
                if (span.offsetWidth <= limit * CustomBlockerUtil.WIDTH_PER_LETTER) {
                    resultText = str;
                    break;
                }
            }
        }
        document.body.removeChild(span);
        return resultText;
    };
    CustomBlockerUtil.getRelativeElementsByXPath = function (targetNode, xpath) {
        var list = new Array();
        try {
            var result = document.evaluate(xpath, targetNode, null, XPathResult.ANY_TYPE, null);
            var node;
            while (node = result.iterateNext()) {
                list.push(node);
            }
        }
        catch (e) {
            console.log(e);
        }
        return list;
    };
    CustomBlockerUtil.getRuleDetailTip = function (rule) {
        if (rule.block_anyway)
            return chrome.i18n.getMessage('blockAnyway');
        if (null == rule.words || rule.words.length == 0)
            return null;
        var lines = new Array();
        var wordStrings = new Array();
        var getWordTip = function (word, map) {
            if (map && map[word.word_id] > 0) {
                return word.word + ("(" + map[word.word_id] + ")");
            }
            return word.word;
        };
        for (var _i = 0, _a = rule.words; _i < _a.length; _i++) {
            var word = _a[_i];
            wordStrings.push(getWordTip(word, rule.appliedWordsMap));
        }
        lines.push(wordStrings.join(', '));
        for (var _b = 0, _c = rule.wordGroups; _b < _c.length; _b++) {
            var group = _c[_b];
            var str = "[" + group.name + "]"
                + group.words.map(function (word) { return getWordTip(word, rule.appliedWordsMap); }).join(",");
            lines.push(str);
        }
        return lines.join(" / ");
    };
    CustomBlockerUtil.arrayEquals = function (array0, array1) {
        if (!array0 || !array1 || array0.length != array1.length) {
            return false;
        }
        for (var i = 0, l = array0.length; i < l; i++) {
            if (array0[i] != array1[i])
                return false;
        }
        return true;
    };
    CustomBlockerUtil.arrayContains = function (array, obj) {
        for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
            var objInArray = array_1[_i];
            if (obj == objInArray)
                return true;
        }
        return false;
    };
    CustomBlockerUtil.isEmpty = function (str) {
        return (null == str || '' == str);
    };
    CustomBlockerUtil.notEmpty = function (str) {
        return !CustomBlockerUtil.isEmpty(str);
    };
    CustomBlockerUtil.getShowHelpAction = function (_fileName) {
        CustomBlockerUtil.REGEX_FILE_NAME.test(_fileName);
        var fileName = RegExp.$1;
        return function (event) {
            CustomBlockerUtil.showHelp(fileName);
        };
    };
    CustomBlockerUtil.addAll = function (array, elementsToAdd) {
        for (var i = 0; i < elementsToAdd.length; i++) {
            array.push(elementsToAdd[i]);
        }
    };
    CustomBlockerUtil.processPage = function () {
        var tags = [];
        CustomBlockerUtil.addAll(tags, document.getElementsByTagName('SPAN'));
        CustomBlockerUtil.addAll(tags, document.getElementsByTagName('LABEL'));
        CustomBlockerUtil.addAll(tags, document.getElementsByTagName('A'));
        var buttons = document.getElementsByTagName('INPUT');
        for (var i = 0, l = tags.length; i < l; i++) {
            var element = tags[i];
            if (null != element.className && element.className.match(CustomBlockerUtil.LOCALIZE_CLASS_REGEXP)) {
                var key = RegExp.$1;
                if (!!chrome.i18n.getMessage(key)) {
                    Log.v("CustomBlockerUtil.processPage " + element.innerHTML + "->" + chrome.i18n.getMessage(key));
                    element.innerHTML = chrome.i18n.getMessage(key);
                }
                else {
                    Log.e("Missing localization key: " + key + ", className=" + element.className);
                }
            }
        }
        for (var i = 0, l = buttons.length; i < l; i++) {
            var element = buttons[i];
            if ('button' != element.getAttribute("type"))
                continue;
            if (null != element.className && element.className.match(CustomBlockerUtil.LOCALIZE_CLASS_REGEXP)) {
                var key = RegExp.$1;
                if (!!chrome.i18n.getMessage(key)) {
                    element.setAttribute("value", chrome.i18n.getMessage(key));
                }
                else {
                    Log.v("CustomBlockerUtil.processPage " + element.getAttribute("value") + "->" + chrome.i18n.getMessage(key));
                }
            }
        }
        var keyPrefix = "customblocker_note_";
        var notes = document.querySelectorAll(".note--dismissable");
        if (notes) {
            var _loop_1 = function (i_1) {
                var note = notes[i_1];
                var noteKey = keyPrefix + note.getAttribute("note_key");
                if (localStorage[noteKey] == "true") {
                    return "continue";
                }
                note.style.display = "block";
                var links = note.getElementsByTagName("a");
                for (var j = 0; j < links.length; j++) {
                    var link = links[j];
                    if (link.className.indexOf("note__dismiss" >= 0)) {
                        link.addEventListener("click", function () {
                            note.style.display = "none";
                            localStorage[noteKey] = "true";
                        });
                    }
                }
            };
            for (var i_1 = 0; i_1 < notes.length; i_1++) {
                _loop_1(i_1);
            }
        }
    };
    CustomBlockerUtil.showHelp = function (fileName) {
        window.open(chrome.extension.getURL('/help/' + chrome.i18n.getMessage('extLocale') + '/' + fileName), "help", "top=10,left=10,width=480 height=500 resizable=yes menubar=no, toolbar=no");
    };
    CustomBlockerUtil.trim = function (str) {
        return str.replace(/^[\s　]+|[\s　]+$/g, '');
    };
    CustomBlockerUtil.createKeywordOptionIcon = function (fileName, suffix, tip) {
        var img = document.createElement("IMG");
        img.title = chrome.i18n.getMessage(tip);
        img.setAttribute("src", chrome.extension.getURL("img/" + fileName + "_" + suffix + ".png"));
        img.className = "option";
        return img;
    };
    CustomBlockerUtil.removeCss = function (path) {
        var existingLinks = document.getElementsByTagName('LINK');
        for (var i = 0, l = existingLinks.length; i < l; i++) {
            var existingLink = existingLinks[i];
            if (CustomBlockerUtil.CSS_CLASS == existingLink.className && (existingLink.getAttribute("href")).indexOf(path) > 0) {
                existingLink.parentNode.removeChild(existingLink);
                return;
            }
        }
    };
    CustomBlockerUtil.isContained = function (targetNode, ancestorNode) {
        if (!ancestorNode || !targetNode)
            return false;
        var node = targetNode;
        while (node && document.body != node) {
            if (node == ancestorNode)
                return true;
            node = node.parentNode;
        }
        return false;
    };
    CustomBlockerUtil.getCommonAncestor = function (elements) {
        var element = elements[0];
        while (element && document.body != element) {
            var containsAll = true;
            for (var i = 1; i < elements.length; i++) {
                if (!CustomBlockerUtil.isContained(elements[i], element))
                    containsAll = false;
            }
            if (containsAll)
                return element;
            element = element.parentNode;
        }
        return document.body;
    };
    CustomBlockerUtil.clearChildren = function (element) {
        while (element.childNodes.length > 0) {
            element.removeChild(element.childNodes[element.childNodes.length - 1]);
        }
    };
    CustomBlockerUtil.getSimilarSiblings = function (element) {
        var parent = element.parentNode;
        if (!parent) {
            return [];
        }
        var similarSiblings = [];
        var siblings = parent.childNodes;
        for (var i = 0, l = siblings.length; i < l; i++) {
            if (siblings[i].tagName == element.tagName && siblings[i] != element)
                similarSiblings.push(siblings[i]);
        }
        return similarSiblings;
    };
    CustomBlockerUtil.getContainedElements = function (ancestorElements, elements) {
        var containedElements = new Array();
        for (var index = 0; index < elements.length; index++) {
            var element = elements[index];
            for (var ancestorIndex = 0; ancestorIndex < ancestorElements.length; ancestorIndex++) {
                if (CustomBlockerUtil.isContained(element, ancestorElements[ancestorIndex])) {
                    containedElements.push(element);
                    break;
                }
            }
        }
        return containedElements;
    };
    CustomBlockerUtil.getSuggestedSiteRegexp = function () {
        var str = location.href.replace(new RegExp('http(s|)://'), '');
        var metaChars = new RegExp('[\\\\^\\.\\$\\*\\?\\|\\(\\)\\[\\]\\{\\}]', 'g');
        str = str.replace(metaChars, function (a, b) { return '\\' + a; });
        return str;
    };
    CustomBlockerUtil.createWordElement = function (word, deleteCallback) {
        var span = CustomBlockerUtil.createSimpleWordElement(word);
        var deleteButton = CustomBlockerUtil.createDeleteButton();
        deleteButton.addEventListener('click', function () { deleteCallback(span); }, true);
        span.appendChild(deleteButton);
        return span;
    };
    CustomBlockerUtil.createWordGroupElement = function (group, deleteCallback) {
        var span = document.createElement("SPAN");
        span.className = "group";
        span.innerHTML = group.name;
        var deleteButton = CustomBlockerUtil.createDeleteButton();
        if (group.words.length > 0) {
            span.title = group.words.map(function (word) { return word.word; }).join(",");
        }
        deleteButton.addEventListener('click', deleteCallback, true);
        span.appendChild(deleteButton);
        return span;
    };
    CustomBlockerUtil.createSimpleWordElement = function (word) {
        var span = document.createElement('SPAN');
        var suffix = word.is_complete_matching ? 'red' : 'blue';
        if (word.is_regexp) {
            span.appendChild(CustomBlockerUtil.createKeywordOptionIcon("keyword_regexp", suffix, "regex"));
        }
        if (word.is_case_sensitive) {
            span.appendChild(CustomBlockerUtil.createKeywordOptionIcon("keyword_case_sensitive", suffix, "case_sensitive"));
        }
        if (word.is_include_href) {
            span.appendChild(CustomBlockerUtil.createKeywordOptionIcon("keyword_include_href", suffix, "include_href"));
        }
        span.innerHTML += word.word;
        span.className = 'word '
            + ((word.is_complete_matching) ? 'complete_matching' : 'not_complete_matching');
        span.setAttribute("avoidStyle", "true");
        return span;
    };
    CustomBlockerUtil.enableFlashZIndex = function () {
        var embeds = document.getElementsByTagName('EMBED');
        for (var i = 0, l = embeds.length; i < l; i++) {
            var embed = embeds[i];
            embed.setAttribute('wmode', 'transparent');
            var param = document.createElement('PARAM');
            param.setAttribute('name', 'wmode');
            param.setAttribute('value', 'transparent');
            if ('OBJECT' == embed.parentNode.tagName) {
                embed.parentNode.appendChild(param);
            }
            else {
                var object = document.createElement('OBJECT');
                object.appendChild(param);
                embed.parentNode.appendChild(object);
                object.appendChild(embed);
            }
        }
    };
    CustomBlockerUtil.applyCss = function (path) {
        var existingLinks = document.getElementsByTagName('LINK');
        for (var i = 0, l = existingLinks.length; i < l; i++) {
            var existingLink = existingLinks[i];
            if (CustomBlockerUtil.CSS_CLASS == existingLink.className && existingLink.getAttribute("href").indexOf(path) > 0)
                return;
        }
        var cssNode = document.createElement('LINK');
        cssNode.setAttribute("href", chrome.extension.getURL(path));
        cssNode.setAttribute("rel", "stylesheet");
        cssNode.className = CustomBlockerUtil.CSS_CLASS;
        document.getElementsByTagName('HEAD')[0].appendChild(cssNode);
    };
    CustomBlockerUtil.createDeleteButton = function () {
        var span = document.createElement('SPAN');
        var button = document.createElement('INPUT');
        button.setAttribute("avoidStyle", "true");
        button.className = 'deleteButton';
        button.setAttribute("typte", "button");
        button.setAttribute("href", 'javascript:void(0)');
        return button;
    };
    return CustomBlockerUtil;
}());
CustomBlockerUtil.initialize();
var Log = (function () {
    function Log() {
    }
    Log.initialize = function () {
        Log.VERBOSE = 1;
        Log.DEBUG = 2;
        Log.INFO = 3;
        Log.WARNING = 4;
        Log.ERROR = 5;
        Log.FILTER_LEVEL = Log.WARNING;
    };
    Log.v = function (message) { Log._write(message, Log.VERBOSE, "v"); };
    Log.d = function (message) { Log._write(message, Log.DEBUG, "d"); };
    Log.i = function (message) { Log._write(message, Log.INFO, "i"); };
    Log.w = function (message) { Log._write(message, Log.WARNING, "w"); };
    Log.e = function (message) { Log._write(message, Log.ERROR, "e"); };
    Log._write = function (message, level, label) {
        if (level >= Log.FILTER_LEVEL) {
            console.log("[Blocker]\t" + "[" + label + "]\t" + new Date() + "\t" + message);
        }
    };
    return Log;
}());
Log.initialize();
//# sourceMappingURL=util.js.map