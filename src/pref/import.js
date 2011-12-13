/**
 * Import JSON
 */
var Import = 
{
	onStart: function()
	{
		var fileSelector = document.getElementById('fileSelector');
		fileSelector.addEventListener('change', Import.readFile);
		CustomBlockerUtil.localize();
	},
	readFile: function (event)
	{
		console.log('Import.readFile');
		var file = event.target.files[0];
		console.log('file.name=' + file.name);
		console.log('file.type=' + file.type);
		var reader = new FileReader ();
		reader.readAsText(file, 'utf8');
		reader.onload =  Import.readContent;
	},
	readContent: function (event)
	{
		console.log('Import.readContent');
		console.log(event.target.result);
		var importedList = JSON.parse(event.target.result);
		Import.list = new Array();
		for (var i=0; i<importedList.length; i++) 
		{
			var listElement = new RuleWrapper(importedList[i]);
			Import.list.push(listElement);
			document.getElementById('ruleList').appendChild(listElement.liElement);
		}
	},
	saveSelected: function (event)
	{
		for (var i=0; i<Import.list.length; i++) 
		{
			var element = Import.list[i];
		}
		Import.savingRuleIndex = 0;
		Import.savingWordIndex = 0;
		Import.rulePeer = RulePeer.getInstance();
		Import.wordPeer = WordPeer.getInstance();
		Import.saveRule();
	},
	saveRule: function ()
	{
		var rule = null;
		while (rule==null && Import.savingRuleIndex<Import.list.length)
		{
			var _rule = Import.list[Import.savingRuleIndex];
			if (_rule && _rule.checkbox.checked) rule = _rule;
			else Import.savingRuleIndex ++;
		}
		Import.savingRuleIndex ++;
		if (!rule) return;
		rule.rule.rule_id = 0;
		Import.rulePeer.saveObject (rule.rule, 
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
	},
	saveWord: function ()
	{
		var word = null;
		var rule = Import.currentRule;
		while (word==null && Import.savingWordIndex<rule.words.length)
		{
			var _word = rule.words[Import.savingWordIndex];
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
		word.word_id = 0;
		word.rule_id = rule.rule_id;
		Import.wordPeer.saveObject (word, 
			function (insertedWord) 
			{
				Import.saveWord();
			},
			function () 
			{
				alert("Error.");
			});
	},
};