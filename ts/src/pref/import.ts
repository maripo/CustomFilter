/**
 * Import JSON
 */
class Import
{
  static savingRuleIndex:number;
  static savingWordIndex:number;
  static ruleList: [Rule];
  static list:[PrefRuleWrapper];
  static currentRule: Rule;
	static onStart ()
	{
		let fileSelector = document.getElementById('fileSelector');
		
		document.getElementById('button_import').addEventListener('click', Import.saveSelected, false);
		
		fileSelector.addEventListener('change', Import.readFile);
		document.getElementById('checkboxToggleAll').addEventListener('change', Import.toggleAllCheckboxes, false);
		RulePeer.getInstance().select('', Import.onRuleListLoaded, null);
		document.getElementById('help_link').setAttribute("href", 'help_' + chrome.i18n.getMessage('extLocale') + '.html');
		document.getElementById('donate_link').setAttribute("href", 'help_' + chrome.i18n.getMessage('extLocale') + '.html#donate');
		document.getElementById('help_link_empty').setAttribute("href", 'help_' + chrome.i18n.getMessage('extLocale') + '.html');
		CustomBlockerUtil.localize();
	}
	static onRuleListLoaded (list:[Rule]) 
	{
		Import.ruleList = list;
		WordPeer.getInstance().select('', Import.onWordListLoaded, null);
	}
	static onWordListLoaded (wordList)
	{
		let ruleMap = new Array();
		for (let i=0, l=Import.ruleList.length; i<l; i++) 
		{
			ruleMap[Import.ruleList[i].rule_id] = Import.ruleList[i];
		}
		// Relate words with rules
		for (let i = 0, l = wordList.length; i < l; i++) 
		{
			let rule = ruleMap[wordList[i].rule_id];
			if (rule) 
			{
				rule.words.push(wordList[i]);
			}
		}
	}
	static readFile (event)
	{
		console.log('Import.readFile');
		let file = event.target.files[0];
		console.log('file.name=' + file.name);
		console.log('file.type=' + file.type);
		let reader = new FileReader ();
		reader.readAsText(file, 'utf8');
		reader.onload =  Import.readContent;
	}
	static toggleAllCheckboxes (sender) {
		PrefRuleWrapper.toggleAllCheckboxes (document.getElementById('checkboxToggleAll'), Import.list);
	}
	static relateWithExistingRule (rule: Rule)
	{
		rule.existing = false;
		rule.rule_id = 0;
		for (let i=0; i<Import.ruleList.length; i++)
		{
			let existingRule = Import.ruleList[i];
			if (existingRule.user_identifier == rule.user_identifier)
			{
				Import.relateWithExistingWord(rule, existingRule);
				rule = existingRule;
				rule.existing = true;
			
			}
		}
		if (!rule.existing)
		{
			for (let i=0; i<rule.words.length; i++)
			{
				rule.words[i].word_id = 0;
			}
		}
		return rule;
	}
	static relateWithExistingWord (rule:Rule, existingRule:Rule)
	{
		if (!existingRule.words || !rule.words) return null;
		for (let i = 0; i < existingRule.words.length; i++)
		{
			let found = false;
			let existingWord = existingRule.words[i];
			for (let j = 0; j < rule.words.length; j++)
			{
				let word = rule.words[j];
				if (word.is_regexp == existingWord.is_regexp && word.word == existingWord.word)
				{
					found = true;
				}
			}
			if (!found)
			{
				existingWord.word_id = 0;
				rule.words.push(existingWord);
			}
		}
	}
	static readContent (event)
	{
    let importedList = [];
		console.log(event.target.result);
		try
		{
			importedList = JSON.parse(event.target.result);
		}
		catch (ex) 
		{
			console.log(ex);
			alert(chrome.i18n.getMessage('importErrorInvalidFormat'));
		}
		Import.list = [] as [PrefRuleWrapper];
		for (let i=0; i<importedList.length; i++) 
		{
			// relate with existing rules
			let rule = Import.relateWithExistingRule(importedList[i]);
			let listElement = new PrefRuleWrapper(rule);
			
			let importIcon = document.createElement('IMG');
			importIcon.setAttribute("src",  (rule.existing)?'../img/import_update.png':'../img/import_add.png');
			importIcon.className = 'importIcon';
			importIcon.title = (rule.existing)?'UPDATE':'NEW';
			listElement.liElement.appendChild(importIcon);
			Import.list.push(listElement);
			document.getElementById('ruleList').appendChild(listElement.liElement);
		}
		document.getElementById('imported').style.display = 'block';
		
	}
	static saveSelected (event)
	{
		(document.getElementById('button_import') as HTMLInputElement).disabled = true;
		Import.savingRuleIndex = 0;
		Import.savingWordIndex = 0;
		Import.saveRule();
	}
	static saveRule ()
	{
		let rule = null;
		while (rule==null && Import.savingRuleIndex<Import.list.length)
		{
			let _rule = Import.list[Import.savingRuleIndex];
			if (_rule && _rule.checkbox.checked) rule = _rule;
			else Import.savingRuleIndex ++;
		}
		Import.savingRuleIndex ++;
		if (!rule)
		{
			alert(chrome.i18n.getMessage('importDone'));
			(document.getElementById('button_import') as HTMLInputElement).disabled = false;

			try {
				let bgWindow = chrome.extension.getBackgroundPage();
				bgWindow.reloadLists();
			}
			catch (ex)
			{
				alert(ex)
			}
			
			return;
		}
		RulePeer.getInstance().saveObject (rule.rule, 
			function (insertedRule) 
			{
			Import.savingWordIndex = 0;
				Import.currentRule = insertedRule;
				Import.saveWord();
			},
			function () 
			{
				alert("Error.");
			});
	}
	static saveWord ()
	{
		let word = null;
		let rule = Import.currentRule;
		while (word==null && Import.savingWordIndex < rule.words.length)
		{
			let _word = rule.words[Import.savingWordIndex];
			if (_word) word = _word;
			else Import.savingWordIndex ++;
		}
		Import.savingWordIndex ++;
		if (!word) 
		{
			// Word list save done.
			Import.saveRule();
			return;
		}
		word.rule_id = rule.rule_id;
		WordPeer.getInstance().saveObject (word, 
			function (insertedWord) 
			{
				Import.saveWord();
			},
			function () 
			{
				alert("Error.");
			});
	}
}
PrefRuleWrapper.getSubDivClassName = function () {
	return "sub_import";
};
window.onload = Import.onStart;