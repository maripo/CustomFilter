/* Legacy functions (for legacy SQLite data storage) */

function createRuleTable (): void {
	console.log("createRuleTable");
	RulePeer.getInstance().createTable(function(){
		WordPeer.getInstance().createTable(loadLists);
	});
}

function loadLists (): void {
	(RulePeer.getInstance() as RulePeer).loadAll (
		function (rules:[Rule]) {
			ruleList = rules;
			loadSmartRuleEditorSrc();
			saveUuidIfNotSet();
		}
	);
}

class SaveRuleTask {
	rule:Rule;
	tabId:number;
	saveWords:Word[];
	deleteWords:Word[];
	reloadLists:()=>void;
	constructor (rule:Rule, reloadLists, tabId) {
		let saveWords:Word[] = [];
		let deleteWords:Word[] = [];
		
		for (var i=0, l=rule.words.length; i<l; i++) {
			var word = rule.words[i];
			if (word.isNew) {
				saveWords.push(word);
			}
			else if (word.deleted) {
				deleteWords.push(word);
			}
		}
		
		this.rule = rule;
		this.tabId = tabId;
		
		this.saveWords = saveWords;
		this.deleteWords = deleteWords;
		
		this.reloadLists /* function */ = reloadLists;
	}
	exec (nextAction) {
		//peer, wordPeer
		RulePeer.getInstance().saveObject(this.rule, this.getNextTask(nextAction), function(){});	
	}
	getNextTask (nextAction): (obj:DbObject)=>void {
		var self = this;
		return function () {
			let nextSaveWord = self.getNextSaveWord();
			if (nextSaveWord) {
				WordPeer.getInstance().saveObject(nextSaveWord, self.getNextTask(nextAction), function(){});
				return;
			}
			let nextDeleteWord = self.getNextDeleteWord();
			if (nextDeleteWord) {
				WordPeer.getInstance().deleteObject(nextDeleteWord, self.getNextTask(nextAction), function(){});
				return;
			}
			chrome.tabs.sendRequest(self.tabId,
			{
				command:nextAction,
				rules: ruleList,
				tabId: self.tabId,
				rule: self.rule
			}
			, getForegroundCallback(self.tabId)
			);
			self.reloadLists();
		}
	}
	getNextSaveWord ():Word {
		for (let i=0, l=this.saveWords.length; i<l; i++) {
			let word = this.saveWords[i];
			if (word.dirty) 
			{
				word.rule_id = this.rule.rule_id;
				return word;
			}
		}
		return null;
	}
	getNextDeleteWord () {
		for (var i=0, l=this.deleteWords.length; i<l; i++) 
		{
			var word = this.deleteWords[i];
			if (word.dirty) 
			{
				word.rule_id = this.rule.rule_id;
				return word;
			}
		}
	}
}