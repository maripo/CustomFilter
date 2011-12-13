/**
 * Import JSON
 */
var Import = 
{
	onStart: function()
	{
		var fileSelector = document.getElementById('fileSelector');
		fileSelector.addEventListener('change', Import.readFile);
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
		alert(importedList.length);
		Import.list = new Array();
		for (var i=0; i<importedList.length; i++) 
		{
			var listElement = new Import.RuleWrapper(importedList[i]);
			Import.list.push(listElement);
			alert(listElement.rule)
			document.getElementById('ruleList').appendChild(listElement.liElement);
		}
	},
	saveSelected: function (event)
	{
		alert('Import.saveSelected');
		for (var i=0; i<Import.list.length; i++) 
		{
			var element = Import.list[i];
			alert (element.checkbox.checked)
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
	RuleWrapper: function (rule)
	{
		this.rule = rule;
		this.liElement = document.createElement('LI');
		this.subLiElement = document.createElement('DIV');
		this.subLiElement.className = 'sub';
		
		this.checkbox = document.createElement('INPUT');
		this.checkbox.type = 'checkbox';
		this.checkbox.className = 'check';
		this.liElement.appendChild(this.checkbox);
		
		var informationDiv = document.createElement('DIV');
		informationDiv.className = 'information';
		
		this.subLiElement.appendChild(informationDiv);
		
		var titleDiv = document.createElement('DIV');
		titleDiv.className = 'title';
		
		titleDiv.innerHTML = CustomBlockerUtil.escapeHTML(CustomBlockerUtil.shorten(this.rule.title, 30));
		
		
		var urlDiv = document.createElement('DIV');
		urlDiv.className = 'url';
		urlDiv.innerHTML = CustomBlockerUtil.escapeHTML(CustomBlockerUtil.shorten(this.rule.site_regexp,30));
		
		var keywordsDiv = document.createElement('DIV');
		keywordsDiv.className = 'keywords';
		
		var keywords = new Array();
		for (var i=0, l=this.rule.words.length; i<l; i++) 
		{
			var keywordSpan = document.createElement('SPAN');
			keywordSpan.className = (this.rule.words[i].is_regexp)?"keyword regex":"keyword normal";
			keywordSpan.innerHTML = this.rule.words[i].word
			keywordsDiv.appendChild(keywordSpan);
		}
		
		
		informationDiv.appendChild(titleDiv);
		informationDiv.appendChild(urlDiv);
		informationDiv.appendChild(keywordsDiv);
		

		var exampleLink = document.createElement('A');
		exampleLink.className = 'exampleUrl';
		exampleLink.innerHTML = '[LINK]';
		exampleLink.target = '_blank';
		exampleLink.href = this.rule.example_url;
		
		var favicon = document.createElement('IMG');
		favicon.src = (this.rule.example_url)?
			'chrome://favicon/' + rule.example_url:chrome.extension.getURL('img/world.png');
			favicon.className = 'favicon';
		informationDiv.appendChild(favicon);
		this.liElement.appendChild(this.subLiElement);
		informationDiv.appendChild(exampleLink);
		
	}

};