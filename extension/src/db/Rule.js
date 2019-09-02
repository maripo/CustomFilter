var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var LegacyRulePeer = (function (_super) {
    __extends(LegacyRulePeer, _super);
    function LegacyRulePeer() {
        var _this = _super.call(this) || this;
        _this.tableName = 'rule';
        _this.addColumn('rule_id', DbColumn.TYPE_PKEY, 1.0, null);
        _this.addColumn('title', DbColumn.TYPE_TEXT, 1.0, null);
        _this.addColumn('is_disabled', DbColumn.TYPE_BOOLEAN, 1.0, null);
        _this.addColumn('site_regexp', DbColumn.TYPE_TEXT, 1.0, null);
        _this.addColumn('example_url', DbColumn.TYPE_TEXT, 1.0, null);
        _this.addColumn('site_description', DbColumn.TYPE_TEXT, 1.0, null);
        _this.addColumn('specify_url_by_regexp', DbColumn.TYPE_BOOLEAN, 2.0, null);
        _this.addColumn('search_block_xpath', DbColumn.TYPE_TEXT, 1.0, null);
        _this.addColumn('search_block_css', DbColumn.TYPE_TEXT, 2.0, null);
        _this.addColumn('search_block_by_css', DbColumn.TYPE_BOOLEAN, 2.0, null);
        _this.addColumn('search_block_description', DbColumn.TYPE_TEXT, 1.0, null);
        _this.addColumn('hide_block_xpath', DbColumn.TYPE_TEXT, 1.0, null);
        _this.addColumn('hide_block_css', DbColumn.TYPE_TEXT, 2.0, null);
        _this.addColumn('hide_block_by_css', DbColumn.TYPE_BOOLEAN, 2.0, null);
        _this.addColumn('hide_block_description', DbColumn.TYPE_TEXT, 1.0, null);
        _this.addColumn('user_identifier', DbColumn.TYPE_TEXT, 3.0, null);
        _this.addColumn('global_identifier', DbColumn.TYPE_TEXT, 3.0, null);
        _this.addColumn('block_anyway', DbColumn.TYPE_BOOLEAN, 1.0, null);
        _this.addColumn('insert_date', DbColumn.TYPE_TIMESTAMP, 1.0, null);
        _this.addColumn('update_date', DbColumn.TYPE_TIMESTAMP, 1.0, null);
        _this.addColumn('delete_date', DbColumn.TYPE_TIMESTAMP, 1.0, null);
        return _this;
    }
    LegacyRulePeer.getInstance = function () {
        if (!LegacyRulePeer.instance) {
            LegacyRulePeer.instance = new LegacyRulePeer();
        }
        return LegacyRulePeer.instance;
    };
    LegacyRulePeer.prototype.createObject = function () {
        var rule = new LegacyRule();
        rule.search_block_by_css = true;
        rule.hide_block_by_css = true;
        return rule;
    };
    LegacyRulePeer.prototype.loadAll = function (callback) {
        var scope = this;
        this.select('', function (rules) {
            var count = '' + rules.length;
            Analytics.trackEvent('loadRuleList', count);
            LegacyWordPeer.getInstance().select('', function (words) {
                var count = '' + words.length;
                Analytics.trackEvent('loadWordList', count);
                var ruleMap = new Array();
                for (var i = 0, l = rules.length; i < l; i++) {
                    ruleMap[rules[i].rule_id] = rules[i];
                }
                for (var i_1 = 0, l_1 = words.length; i_1 < l_1; i_1++) {
                    var rule = ruleMap[words[i_1].rule_id];
                    if (rule) {
                        rule.words.push(words[i_1]);
                    }
                }
                callback(rules);
            }, null);
        }, null);
    };
    return LegacyRulePeer;
}(DbPeer));
var LegacyRule = (function (_super) {
    __extends(LegacyRule, _super);
    function LegacyRule() {
        var _this = _super.call(this) || this;
        _this.words = [];
        _this.title = "";
        _this.site_regexp = "";
        _this.example_url = "";
        _this.site_description = "";
        _this.search_block_css = "";
        _this.search_block_xpath = "";
        _this.search_block_by_css = true;
        _this.search_block_description = "";
        _this.hide_block_css = "";
        _this.hide_block_xpath = "";
        _this.hide_block_by_css = true;
        _this.hide_block_description = "";
        _this.block_anyway = false;
        _this.specify_url_by_regexp = false;
        _this.appliedWords = [];
        _this.appliedWordsMap = {};
        return _this;
    }
    LegacyRule.prototype.addWord = function (word) {
        this.words.push(word);
    };
    LegacyRule.createInstance = function (url, title) {
        var rule = new LegacyRule();
        rule.title = title;
        rule.site_regexp = url;
        rule.example_url = url;
        rule.site_description = title;
        return rule;
    };
    LegacyRule.validate = function (params) {
        var errors = [];
        if ('' == params.title)
            errors.push(chrome.i18n.getMessage('errorTitleEmpty'));
        if ('' == params.site_regexp)
            errors.push(chrome.i18n.getMessage('errorSiteRegexEmpty'));
        if ('' != params.search_block_xpath) {
            try {
                CustomBlockerUtil.getElementsByXPath(params.search_block_xpath);
            }
            catch (e) {
                errors.push(chrome.i18n.getMessage('errorHideXpathInvalid'));
            }
        }
        if ('' != params.hide_block_xpath) {
            try {
                CustomBlockerUtil.getElementsByXPath(params.hide_block_xpath);
            }
            catch (e) {
                errors.push(chrome.i18n.getMessage('errorSearchXpathInvalid'));
            }
        }
        return errors;
    };
    LegacyRule.prototype.getRule = function () {
        if (!this.rule) {
            this.rule = cbStorage.createRule();
            this.rule.hideNodes = this.hideNodes;
            this.rule.searchNodes = this.searchNodes;
            this.rule.hiddenCount = this.hiddenCount;
            this.rule.staticXpath = this.staticXpath;
            this.rule.appliedWords = this.appliedWords;
            this.rule.appliedWordsMap = this.appliedWordsMap;
            this.rule.is_disabled = this.is_disabled;
            this.rule.global_identifier = this.global_identifier;
            this.rule.title = this.title;
            this.rule.url = this.url;
            this.rule.site_regexp = this.site_regexp;
            this.rule.example_url = this.example_url;
            this.rule.search_block_css = this.search_block_css;
            this.rule.search_block_xpath = this.search_block_xpath;
            this.rule.search_block_by_css = this.search_block_by_css;
            this.rule.hide_block_css = this.hide_block_css;
            this.rule.hide_block_xpath = this.hide_block_xpath;
            this.rule.hide_block_by_css = this.hide_block_by_css;
            this.rule.block_anyway = this.block_anyway;
            this.rule.specify_url_by_regexp = this.specify_url_by_regexp;
            this.rule.existing = this.existing;
            this.rule.words = [];
            for (var _i = 0, _a = this.words; _i < _a.length; _i++) {
                var word = _a[_i];
                this.rule.words.push(word.getWord());
            }
        }
        return this.rule;
    };
    LegacyRule.prototype.legacyRuleFunc = function () {
    };
    return LegacyRule;
}(DbObject));
//# sourceMappingURL=Rule.js.map