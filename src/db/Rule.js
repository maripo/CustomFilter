/**
 * Peer
 */
var RulePeer = function () 
{
	new DbPeer();
};
RulePeer.prototype = new DbPeer();

RulePeer.getInstance = function () 
{
	if (RulePeer.instance) return instance;
	var instance = new RulePeer();
	
	instance.tableName = 'rule';
	instance.addColumn('rule_id', DbColumn.TYPE_PKEY, 1.0);
	
	instance.addColumn('title', DbColumn.TYPE_TEXT, 1.0);
	instance.addColumn('is_disabled', DbColumn.TYPE_BOOLEAN, 1.0);
	
	// Site Matcher
	instance.addColumn('site_regexp', DbColumn.TYPE_TEXT, 1.0);
	instance.addColumn('example_url', DbColumn.TYPE_TEXT, 1.0);
	instance.addColumn('site_description', DbColumn.TYPE_TEXT, 1.0);

	instance.addColumn('specify_url_by_regexp', DbColumn.TYPE_BOOLEAN, 2.0);
	
	// Element Matcher
	instance.addColumn('search_block_xpath', DbColumn.TYPE_TEXT, 1.0);
	instance.addColumn('search_block_css', DbColumn.TYPE_TEXT, 2.0);
	instance.addColumn('search_block_by_css', DbColumn.TYPE_BOOLEAN, 2.0);
	instance.addColumn('search_block_description', DbColumn.TYPE_TEXT, 1.0);
	instance.addColumn('hide_block_xpath', DbColumn.TYPE_TEXT, 1.0);
	instance.addColumn('hide_block_css', DbColumn.TYPE_TEXT, 2.0);
	instance.addColumn('hide_block_by_css', DbColumn.TYPE_BOOLEAN, 2.0);
	instance.addColumn('hide_block_description', DbColumn.TYPE_TEXT, 1.0);

	instance.addColumn('user_identifier', DbColumn.TYPE_TEXT, 3.0);
	instance.addColumn('global_identifier', DbColumn.TYPE_TEXT, 3.0);
	
	instance.addColumn('block_anyway', DbColumn.TYPE_BOOLEAN, 1.0);
	
	instance.addColumn('insert_date', DbColumn.TYPE_TIMESTAMP, 1.0);
	instance.addColumn('update_date', DbColumn.TYPE_TIMESTAMP, 1.0);
	instance.addColumn('delete_date', DbColumn.TYPE_TIMESTAMP, 1.0);
	
	RulePeer.instance =  instance;
	return RulePeer.instance;
}

RulePeer.prototype.createObject = function () 
{
	var rule = new Rule();
	// Default Values (CSS on)
	rule.search_block_by_css = true;
	rule.hide_block_by_css = true;
	return rule;
};
/**
 * Object
 */
var Rule = function()
{
	this.words = [];
};
Rule.createInstance = function (url, title) 
{
	var rule = new Rule();
	rule.title = title;
	rule.site_regexp = url;
	rule.example_url = url;
	rule.site_description = title;

	rule.search_block_css = "";
	rule.search_block_xpath = "";
	rule.search_block_by_css = true;
	rule.search_block_description = "";

	rule.hide_block_css = "";
	rule.hide_block_xpath = "";
	rule.hide_block_by_css = true;
	rule.hide_block_description = "";
	
	rule.block_anyway = false;
	rule.specify_url_by_regexp = false;
	return rule;
};
Rule.prototype.addWord = function(word)
{
	this.words.push(word);	
};
Rule.prototype.getPeer = function () 
{
	return RulePeer.getInstance();
};

Rule.Validator = {
};
Rule.Validator.validate = function (params)
{
	var errors = new Array();
	if (''==params.title) errors.push(chrome.i18n.getMessage('errorTitleEmpty'));
	if (''==params.site_regexp) errors.push(chrome.i18n.getMessage('errorSiteRegexEmpty'));
	if (''!=params.search_block_xpath) {
		try
		{
			CustomBlockerUtil.getElementsByXPath(params.search_block_xpath);
		}
		catch (e)
		{
			errors.push(chrome.i18n.getMessage('errorHideXpathInvalid'));
		}
	}
	if (''!=params.hide_block_xpath) {
		try
		{
			CustomBlockerUtil.getElementsByXPath(params.hide_block_xpath);
		}
		catch (e)
		{
			errors.push(chrome.i18n.getMessage('errorSearchXpathInvalid'));
		}
	}
	return errors;
};
