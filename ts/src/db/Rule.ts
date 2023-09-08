/**
* Peer
*/
class LegacyRulePeer extends DbPeer {
	private static instance:LegacyRulePeer;
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
	public static getInstance () : DbPeer {
		if (!LegacyRulePeer.instance) {
			LegacyRulePeer.instance =  new LegacyRulePeer();
		}
		return LegacyRulePeer.instance;
	}
	createObject() : DbObject {
		let rule = new LegacyRule();
		// Default Values (CSS on)
		rule.search_block_by_css = true;
		rule.hide_block_by_css = true;
		return rule;
	}

	public loadAll (callback:([LegacyRule])=>void): void {
		let scope = this;
		this.select('', function (rules:[LegacyRule]): void {
			let count = '' + rules.length;
			// Add words to parent rules
			LegacyWordPeer.getInstance().select('', function (words:LegacyWord[]): void {
				var count = '' + words.length;
				let ruleMap = new Array();
				for (var i=0, l=rules.length; i<l; i++) {
					ruleMap[rules[i].rule_id] = rules[i];
				}
				for (let i = 0, l = words.length; i < l; i++) {
					let rule = ruleMap[words[i].rule_id] as LegacyRule;
					if (rule) {
						rule.words.push(words[i]);
					}
				}
				callback(rules);
			}
			, null);
		}, null);
	}
}
/**
* Object
*/
class LegacyRule extends DbObject {
	words:LegacyWord[];

	// TODO move to wrapper class!
	hideNodes: HTMLElement[];
	searchNodes: HTMLElement[];
	hiddenCount:number;
	staticXpath:any; // TODO What's this?

	appliedWords:any[];
	appliedWordsMap: object;
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

	existing: boolean; // TODO for import/export

	public addWord (word:LegacyWord) {
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
		this.appliedWords = [];
		this.appliedWordsMap = {};

	}


	public static createInstance (url:string, title:string): LegacyRule {
		let rule = new LegacyRule();
		rule.title = title;
		rule.site_regexp = url;
		rule.example_url = url;
		rule.site_description = title;
		return rule;
	}

	public static validate (params:RuleValidation): string[] {
		let errors:string[] = [];
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

	// Convert legacy rule to new rule
	rule: Rule;
	getRule () : Rule {
		if (!this.rule) {
			// Just copy properties
			this.rule =  cbStorage.createRule();
			this.rule.hideNodes = this.hideNodes;
			this.rule.searchNodes = this.searchNodes;
			this.rule.hiddenCount = this.hiddenCount;
			this.rule.staticXpath = this.staticXpath;
			this.rule.appliedWords = this.appliedWords;
			this.rule.appliedWordsMap = this.appliedWordsMap;

			this.rule.is_disabled = this.is_disabled;

			// this.rule.rule_id = this.rule_id;
			// this.rule.user_identifier = this.user_identifier;
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

			this.rule.words = [] as [Word];
			for (let word of this.words) {
				this.rule.words.push(word.getWord());
			}

		}
		return this.rule;
	}
	legacyRuleFunc (): void {
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
