/* Storage management */
class CustomBlockerStorage {
	static JSON_WORD_FLAG_REGEXP: number;
	static JSON_WORD_FLAG_COMPLETE_MATCHING: number;
	static JSON_WORD_FLAG_CASE_SENSITIVE: number;
	static JSON_WORD_FLAG_INCLUDE_HREF: number;
	static JSON_RULE_CONVERSION_RULE: [[string]];
	
	public createRule (): Rule {
		return {
			dirty: false,
			isNew: false,
			deleted: false,
			insert_date: 0,
			update_date: 0,
			delete_date: 0,
			words: [] as [Word],
			wordGroups: [] as [WordGroup],
			hideNodes: [] as [HTMLElement],
			searchNodes: [] as [HTMLElement],
			hiddenCount: 0,
			staticXpath: null,
			
			appliedWords:null,
			is_disabled:false,
 	
 			rule_id: 0,
 			user_identifier: null,
 			global_identifier: null,
 			title: null,
 			url: null,
 			site_regexp: null,
 			example_url: null,
 	
		 	search_block_css: null,
 			search_block_xpath: null,
 			search_block_by_css:false,
 	
 			hide_block_css: null,
 			hide_block_xpath: null,
 			hide_block_by_css: false,
 	
 			block_anyway: false,
 			specify_url_by_regexp: false,
 			existing: false
		};
	}
	
	public createWord (): Word {
		return {
			word_id:0,
			rule_id:0,
			word:null,
			newWord: null,
			
			is_regexp:false,
			is_complete_matching:false,
			is_case_sensitive:false,
			is_include_href:false,
			
			dirty:false,
			isNew:false,
			deleted:false,
			insert_date:0,
			update_date:0,
			delete_date:0,
			
		 	regExp:null, 
		 	
		 	checkedNodes: [] as [HTMLElement]
		};
	}
	
	// Save & load
	public loadAll (callback:([Rule])=>void): void {
		console.log("loadAll TODO");
		let scope = this;
		chrome.storage.sync.get(null, function (allObj) {
			console.log(allObj);
			let rules = [] as [Rule];
			for (let key in allObj) {
				if (key.indexOf("R-")==0) {
					console.log("Key found. " + key);
					let rule = cbStorage.createRule();
					scope.initRuleByJSON(rule, allObj[key]);
					rules.push(rule);
				} else {
					console.log("Invalid key: " + key);
				}
			}
			callback(rules);
		});
	}
	
	public saveRule (rule:Rule, callback:()=>void) {
		console.log("Rule save stub called.");
		if (CustomBlockerUtil.isEmpty(rule.global_identifier)) {
			rule.global_identifier = UUID.generate();
		}
		let obj = {};
		obj[this.getRuleJSONKey(rule)] = this.convertRuleToJSON(rule);
		chrome.storage.sync.set(obj, function() {
			console.log("Saved rule.");
			if (callback) {
				callback();
			}
		});
	}
	
	public static createWordInstance (url:string, title:string): Rule {
		let rule = cbStorage.createRule();
		rule.title = title;
		rule.site_regexp = url;
		rule.example_url = url;
		return rule;
	}
	
	public deleteRule (rule:Rule, callback: ()=>void) {
		// TODO
	}
	
	public addWordToRule (rule:Rule, word:Word) {
		rule.words.push(word);	
	
	}
	
	public removeWordFromRule (rule:Rule, word:Word) {
		let wordIndex = rule.words.indexOf(word);
		if (wordIndex >= 0) {
		  rule.words.splice(wordIndex, 1);
		}
	
	}
	
	public getRuleJSONKey (rule:Rule): string {
		return "R-" + rule.global_identifier;
	
	}
	
	public convertRuleToJSON (rule:Rule): object {
		let obj = {};
		for (let prop of CustomBlockerStorage.JSON_RULE_CONVERSION_RULE) {
			obj[prop[1]] = (rule as object)[prop[0]];
		}
		obj["w"] = []; // Words
		obj["wg"] = []; // Word group
		for (let word of rule.words) {
			obj["w"].push(this.convertWordToJSON(word));
		}
		/*
		
		for (let wordGroup of this.wordGroups) {
			obj["wg"].push(wordGroup.getJSON();
		}
		*/
		return obj;
	}
	
	public convertWordToJSON (word:Word): any {
		let flags = [] as [number];
		if (word.is_regexp) { flags.push(CustomBlockerStorage.JSON_WORD_FLAG_REGEXP); }
		if (word.is_complete_matching) { flags.push(CustomBlockerStorage.JSON_WORD_FLAG_COMPLETE_MATCHING); }
		if (word.is_case_sensitive) { flags.push(CustomBlockerStorage.JSON_WORD_FLAG_CASE_SENSITIVE); }
		if (word.is_include_href) { flags.push(CustomBlockerStorage.JSON_WORD_FLAG_INCLUDE_HREF); }
		
		if (flags.length > 0) {
			let obj = {};
			obj["w"] = word.word;
			obj["f"] = flags;
			return obj;
		} else {
			return word.word;
		}
	}
	
	public createRuleByJSON (json:object): Rule {
		let rule = cbStorage.createRule();
		return rule;
	}
	public initRuleByJSON (rule:Rule, json:object): Rule {
		// TODO
		for (let prop of CustomBlockerStorage.JSON_RULE_CONVERSION_RULE) {
			(rule as object)[prop[0]] = json[prop[1]]; 
		}
		rule.words = [];
		rule.wordGroups = [];
		let words = json["w"] as [any];
		let wordGroups = json["wg"] as [any];
		for (let word of words) {
			let wordObj = this.createWord();
			this.initWordByJSON(wordObj, word);
			rule.words.push(wordObj);
		}
		return rule;
	}
	
	public initWordByJSON (word:Word, obj:any): void {
		if (typeof(obj)=="string") {
			word.word = obj as string;
		} else {
			let jsonObj = obj as object;
			word.word = jsonObj["w"];
			if (jsonObj["f"]) {
				// Flags
				let flags = jsonObj["f"] as [number];
				for (let flagNum of flags) {
					if (flagNum==CustomBlockerStorage.JSON_WORD_FLAG_REGEXP) { word.is_regexp = true; }
					if (flagNum==CustomBlockerStorage.JSON_WORD_FLAG_COMPLETE_MATCHING) { word.is_complete_matching = true; }
					if (flagNum==CustomBlockerStorage.JSON_WORD_FLAG_CASE_SENSITIVE) { word.is_case_sensitive = true; }
					if (flagNum==CustomBlockerStorage.JSON_WORD_FLAG_INCLUDE_HREF) { word.is_include_href = true; }
				}
			}
		}
	}
	
	public validateRule (params:RuleValidation): string[] {
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
	
	
	// Initialize static fields
	static init () {
		CustomBlockerStorage.JSON_RULE_CONVERSION_RULE = [
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
		CustomBlockerStorage.JSON_WORD_FLAG_REGEXP = 1;
		CustomBlockerStorage.JSON_WORD_FLAG_COMPLETE_MATCHING = 2;
		CustomBlockerStorage.JSON_WORD_FLAG_CASE_SENSITIVE = 3;
		CustomBlockerStorage.JSON_WORD_FLAG_INCLUDE_HREF = 4;
	}
}


CustomBlockerStorage.init();
let cbStorage = new CustomBlockerStorage();
