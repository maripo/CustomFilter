// New rule class

class NewRule {
	static JSON_RULE_CONVERSION_RULE: [[string]];
	// Copied from legacy DbObj
	
	dirty:boolean;
	isNew:boolean;
	deleted:boolean;
	insert_date:number;
	update_date:number;
	delete_date:number;
	
	// Copied from legacy Rule
 	words:NewWord[];
 	wordGroups:WordGroup[];
 	
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
 	
 	search_block_css:string;
 	search_block_xpath:string;
 	search_block_by_css:boolean;
 	
 	hide_block_css:string;
 	hide_block_xpath:string;
 	hide_block_by_css:boolean;
 	
 	block_anyway:boolean;
 	specify_url_by_regexp:boolean;
 	
 	existing: boolean; // TODO for import/export
 	
 	public addWord (word:NewWord) {
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
	public saveTest (callback): void {
		// Save to synced storage
		
		// TODO generate key (for new object)
		// TODO Generate JSON
		// TODO Save / Load
		let key = this.getJSONKey ();
		let json = this.toJSON();
		console.log("Key=" + key);
		console.log(JSON.stringify(json));
		
		let testRule = new NewRule();
		testRule.initByJSON(json);
		
		/*
		console.log("Orig:");
		console.log(JSON.stringify(this));
		console.log(JSON.stringify(this).length);
		console.log("Re:");
		console.log(JSON.stringify(testRule));
		console.log(JSON.stringify(testRule).length);
		*/
		let isEqual = JSON.stringify(this) == JSON.stringify(testRule);
		console.log("Equal? " + isEqual)
		
		
		// TODO JSON size
	}
	
	// load / update locally
	initByJSON (obj:object) {
		// TODO
		for (let prop of NewRule.JSON_RULE_CONVERSION_RULE) {
			(this as object)[prop[0]] = obj[prop[1]]; 
		}
		this.words = [];
		this.wordGroups = [];
		let words = obj["w"] as [any];
		let wordGroups = obj["wg"] as [any];
		for (let word of words) {
			let wordObj = new NewWord();
			wordObj.initByJSON(word);
			this.words.push(wordObj);
		}
	}
	
	// Update by data sync (Merge word list if needed)
	sync (obj) {
		// compare updated date
	}
	
	getJSONKey(): string {
		return this.global_identifier;
	}
	
	toJSON (): object {
		let obj = {};
		for (let prop of NewRule.JSON_RULE_CONVERSION_RULE) {
			obj[prop[1]] = (this as object)[prop[0]];
		}
		obj["w"] = []; // Words
		obj["wg"] = []; // Word group
		for (let word of this.words) {
			obj["w"].push(word.toJSON());
		}
		/*
		
		for (let wordGroup of this.wordGroups) {
			obj["wg"].push(wordGroup.getJSON();
		}
		*/
		return obj;
	}
	
}

NewRule.JSON_RULE_CONVERSION_RULE = [
	["global_identifier", "g"],
	["title", "t"],
	["url", "uu"],
	["specify_url_by_regexp", "ur"],
	["site_regexp", "ux"],
	["example_url", "ue"],
	["search_block_css", "sc"],
	["search_block_xpath", "sx"],
	["search_block_by_css", "st"],
	["hide_block_css", "hc"],
	["hide_block_xpath", "hx"],
	["hide_block_by_css", "ht"],
	["insert_date:number", "di"],
	["update_date:number", "du"],
	
	["block_anyway", "b"]
];