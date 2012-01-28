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
	instance.addColumn('rule_id', DbColumn.TYPE_PKEY);
	
	instance.addColumn('title', DbColumn.TYPE_TEXT);
	instance.addColumn('is_disabled', DbColumn.TYPE_BOOLEAN);
	
	// Site Matcher
	instance.addColumn('site_regexp', DbColumn.TYPE_TEXT);
	instance.addColumn('example_url', DbColumn.TYPE_TEXT);
	instance.addColumn('site_description', DbColumn.TYPE_TEXT);
	
	// Element Matcher
	instance.addColumn('search_block_xpath', DbColumn.TYPE_TEXT);
	instance.addColumn('search_block_css', DbColumn.TYPE_TEXT);
	instance.addColumn('search_block_by_css', DbColumn.TYPE_BOOLEAN);
	instance.addColumn('search_block_description', DbColumn.TYPE_TEXT);
	instance.addColumn('hide_block_xpath', DbColumn.TYPE_TEXT);
	instance.addColumn('hide_block_css', DbColumn.TYPE_TEXT);
	instance.addColumn('hide_block_by_css', DbColumn.TYPE_BOOLEAN);
	instance.addColumn('hide_block_description', DbColumn.TYPE_TEXT);
	
	instance.addColumn('block_anyway', DbColumn.TYPE_BOOLEAN);
	
	instance.addColumn('insert_date', DbColumn.TYPE_TIMESTAMP);
	instance.addColumn('update_date', DbColumn.TYPE_TIMESTAMP);
	instance.addColumn('delete_date', DbColumn.TYPE_TIMESTAMP);
	
	RulePeer.instance =  instance;
	return RulePeer.instance;
}

RulePeer.prototype.createObject = function () 
{
	var rule = new Rule();
	return rule;
};
/**
 * Object
 */
var Rule = function()
{
	this.words = [];
};
Rule.createInstance = function () 
{
	var rule = new Rule();
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
