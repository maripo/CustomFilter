/**
 * Peer
 */
class RulePeer extends DbPeer {
	private static instance:RulePeer
	constructor () {
		super();
		this.tableName = 'rule';
		this.addColumn('rule_id', DbColumn.TYPE_PKEY, 1.0, null);
		
		this.addColumn('title', DbColumn.TYPE_TEXT, 1.0, null);
		this.addColumn('is_disabled', DbColumn.TYPE_BOOLEAN, 1.0, null);
		
		// Site Matcher
		this.addColumn('site_regexp', DbColumn.TYPE_TEXT, 1.0, null);
		this.addColumn('example_url', DbColumn.TYPE_TEXT, 1.0, null);
		this.addColumn('site_description', DbColumn.TYPE_TEXT, 1.0, null);
	
		this.addColumn('specify_url_by_regexp', DbColumn.TYPE_BOOLEAN, 2.0, null);
		
		// Element Matcher
		this.addColumn('search_block_xpath', DbColumn.TYPE_TEXT, 1.0, null);
		this.addColumn('search_block_css', DbColumn.TYPE_TEXT, 2.0, null);
		this.addColumn('search_block_by_css', DbColumn.TYPE_BOOLEAN, 2.0, null);
		this.addColumn('search_block_description', DbColumn.TYPE_TEXT, 1.0, null);
		this.addColumn('hide_block_xpath', DbColumn.TYPE_TEXT, 1.0, null);
		this.addColumn('hide_block_css', DbColumn.TYPE_TEXT, 2.0, null);
		this.addColumn('hide_block_by_css', DbColumn.TYPE_BOOLEAN, 2.0, null);
		this.addColumn('hide_block_description', DbColumn.TYPE_TEXT, 1.0, null);
	
		this.addColumn('user_identifier', DbColumn.TYPE_TEXT, 3.0, null);
		this.addColumn('global_identifier', DbColumn.TYPE_TEXT, 3.0, null);
		
		this.addColumn('block_anyway', DbColumn.TYPE_BOOLEAN, 1.0, null);
		
		this.addColumn('insert_date', DbColumn.TYPE_TIMESTAMP, 1.0, null);
		this.addColumn('update_date', DbColumn.TYPE_TIMESTAMP, 1.0, null);
		this.addColumn('delete_date', DbColumn.TYPE_TIMESTAMP, 1.0, null);
	}
	getInstance () : DbPeer {
		if (RulePeer.instance) {
			return RulePeer.instance;
		}
		RulePeer.instance =  new RulePeer();
		return RulePeer.instance;
	}
	createObject() : DbObject {
		var rule = new Rule();
		// Default Values (CSS on)
		rule.search_block_by_css = true;
		rule.hide_block_by_css = true;
		return rule;
	}
}
/**
 * Object
 */
 class Rule extends DbObject {
 	words:Word[];
 	
 	// TODO move to wrapper class!
 	hideNodes: HTMLElement[];
 	searchNodes: HTMLElement[];
 	hiddenCount:number;
 	
 	appliedWords:object; 
 	is_disabled:boolean;
 	
 	rule_id:number; // Primary key
 	user_identifier:string;
 	global_identifier:string;
 	title:string;
 	url:string;
 	site_regexp:string;
 	example_url: string;
 	site_description:string;
 	
 	search_block_css:string;
 	search_block_xpath:string;
 	search_block_by_css:boolean;
 	search_block_description:string;
 	hide_block_css:string;
 	hide_block_xpath:string;
 	hide_block_by_css:boolean;
 	hide_block_description:string;
 	
 	block_anyway:boolean;
 	specify_url_by_regexp:boolean;
 	
 	public addWord (word:Word) {
		this.words.push(word);	
	}
	
	
	constructor () {
		super();
 		this.words = [];
		this.title = "";
		this.site_regexp = "";
		this.example_url = "";
		this.site_description = "";
	
		this.search_block_css = "";
		this.search_block_xpath = "";
		this.search_block_by_css = true;
		this.search_block_description = "";
	
		this.hide_block_css = "";
		this.hide_block_xpath = "";
		this.hide_block_by_css = true;
		this.hide_block_description = "";
		
		this.block_anyway = false;
		this.specify_url_by_regexp = false;
		this.appliedWords = {};
	
	}
	
	
	public static createInstance (url:string, title:string): Rule {
		let rule = new Rule();
		rule.title = title;
		rule.site_regexp = url;
		rule.example_url = url;
		rule.site_description = title;
		return rule;
	}
	public getPeer (): DbPeer {
		return RulePeer.getInstance();
	}
	public static validate (params:RuleValidation):string[] {
		var errors:string[] = [];
		if (''==params.title) errors.push(chrome.i18n.getMessage('errorTitleEmpty'));
		if (''==params.site_regexp) errors.push(chrome.i18n.getMessage('errorSiteRegexEmpty'));
		if (''!=params.search_block_xpath) {
			try {
				CustomBlockerUtil.getElementsByXPath(params.search_block_xpath);
			}
			catch (e) {
				errors.push(chrome.i18n.getMessage('errorHideXpathInvalid'));
			}
		}
		if (''!=params.hide_block_xpath) {
			try {
				CustomBlockerUtil.getElementsByXPath(params.hide_block_xpath);
			}
			catch (e) {
				errors.push(chrome.i18n.getMessage('errorSearchXpathInvalid'));
			}
		}
		return errors;
	}
}
interface RuleValidation {
	title:string, 
	site_regexp:string, 
	search_block_xpath:string, 
	hide_block_xpath:string,
	
	example_url?:string;
	site_description?:string;
	search_block_css?:string;
	search_block_description?:string;
	hide_block_css?:string;
	hide_block_description?:string;
}
// Rule.Validator was moved into Rule (static)