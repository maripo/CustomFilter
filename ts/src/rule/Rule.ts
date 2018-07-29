// New rule class

class NewRule {
 	words:Word[];
 	
 	// TODO move to wrapper class!
 	hideNodes: HTMLElement[];
 	searchNodes: HTMLElement[];
 	hiddenCount:number;
 	staticXpath:any; // TODO What's this?
 	
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
 	
 	existing: boolean; // TODO for import/export
 	
 	public addWord (word:Word) {
		this.words.push(word);	
	}
	
	constructor () {
	}
	
	public static createInstance (url:string, title:string): Rule {
		let rule = new Rule();
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
}