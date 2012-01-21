
var ruleList = new Array();
var appliedRuleMap = new Array();
var ruleContainerList = new Array();

var ruleEditor;

var peer = RulePeer.getInstance();
var wordPeer = WordPeer.getInstance();
function onStart () 
{
	document.getElementById('help_link').href = 'help_' + chrome.i18n.getMessage('extLocale') + '.html';
	document.getElementById('help_link_empty').href = 'help_' + chrome.i18n.getMessage('extLocale') + '.html'; 
	ruleEditor = new RuleEditor();
	peer.createTable(createWordTable);
	CustomBlockerUtil.localize();
}
function createWordTable () 
{
	console.log("createWordTable");
	wordPeer.createTable(loadLists);
}
function loadLists () 
{
	console.log("loadLists");
	peer.select('', onRuleListLoaded, null);
}
function showEmptyAlert ()
{
	document.getElementById('ruleList').style.display = 'none';
	document.getElementById('ruleEmptyAlert').style.display = 'block';
}
function hideEmptyAlert ()
{
	document.getElementById('ruleList').style.display = 'block';
	document.getElementById('ruleEmptyAlert').style.display = 'none';
}
function onRuleListLoaded (list) 
{
	console.log("onRuleListLoaded");
	if (!list || list.length==0)
		showEmptyAlert();
	ruleList = list;
	wordPeer.select('', onWordListLoaded, null);
}
function onWordListLoaded (wordList) 
{
	console.log("onWordListLoaded");
	var ruleMap = new Array();
	for (var i=0, l=ruleList.length; i<l; i++) 
	{
		ruleMap[ruleList[i].rule_id] = ruleList[i];
		ruleContainerList.push(new RuleContainer(ruleList[i]));
		console.log("rule title=" + ruleList[i].title);
	}
	for (var i = 0, l = wordList.length; i < l; i++) 
	{
		var rule = ruleMap[wordList[i].rule_id];
		if (rule) 
		{
			rule.words.push(wordList[i]);
		}
	}
	for (var i = 0, l = ruleContainerList.length; i < l; i++) 
	{
		var container = ruleContainerList[i];
		var element = container.getLiElement();
		document.getElementById('ruleList').appendChild(element);
	}
}

var RuleContainer = function (rule) 
{
	this.rule = rule;
	this.liElement = null;
};

RuleContainer.prototype.getLiElement = function () 
{
	if (this.liElement) return this.liElement;
	this.liElement = document.createElement('LI');
	
	var buttonContainer = document.createElement('DIV');
	buttonContainer.className = 'buttonContainer';
	buttonContainer.appendChild(this.createSelectButton());
	buttonContainer.appendChild(this.createDeleteButton());
	
	this.disableBox = this.createDisableBox();
	buttonContainer.appendChild(this.disableBox);
	
	this.liElement.appendChild(buttonContainer);
	
	var informationDiv = document.createElement('DIV');
	informationDiv.className = 'information';
	
	this.liElement.appendChild(informationDiv);
	
	var titleDiv = document.createElement('DIV');
	titleDiv.className = 'title';
	
	titleDiv.innerHTML = CustomBlockerUtil.escapeHTML(CustomBlockerUtil.shorten(this.rule.title, 30));
	
	
	var urlDiv = document.createElement('DIV');
	urlDiv.className = 'url';
	urlDiv.innerHTML = CustomBlockerUtil.escapeHTML(CustomBlockerUtil.shorten(this.rule.site_regexp,30));
	
	var keywordsDiv = document.createElement('DIV');
	keywordsDiv.className = 'keywords';
	
	var keywords = new Array();
	if (this.rule.block_anyway)
	{
		var span = document.createElement('SPAN');
		span.innerHTML = 'Block Anyway';
		span.className = 'blockAnyway';
		keywordsDiv.appendChild(span);
	}
	else
	{
		for (var i=0, l=this.rule.words.length; i<l; i++) 
		{
			var keywordSpan = document.createElement('SPAN');
			keywordSpan.className = (this.rule.words[i].is_regexp)?"keyword regex":"keyword normal";
			keywordSpan.innerHTML = this.rule.words[i].word
			keywordsDiv.appendChild(keywordSpan);
		}
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
		'chrome://favicon/' + this.rule.example_url:chrome.extension.getURL('img/world.png');
		favicon.className = 'favicon';
	informationDiv.appendChild(favicon);
	
	informationDiv.appendChild(exampleLink);
	
	this.liElement.addEventListener('click', this.getSelectAction(), true);
	
	return this.liElement;
};

function deselectAll () 
{
	for (var i=0, l=ruleContainerList.length; i<l; i++)
	{
		ruleContainerList[i].liElement.className = '';
	}	
}

RuleContainer.prototype.createDisableBox = function () 
{
	var span = document.createElement('SPAN');
	var input = document.createElement('INPUT');
	input.type = 'BUTTON';
	input.value = (this.rule.is_disabled)?'OFF':'ON';
	input.style.backgroundColor = (this.rule.is_disabled)?'#f8a':'#4f8';
	span.appendChild(input);
	input.addEventListener('click', this.getDisableAction(input), true);
	return span;
}
RuleContainer.prototype.createSelectButton = function () 
{
	var button = document.createElement('INPUT');
	button.type = 'BUTTON';
	button.value = chrome.i18n.getMessage('buttonLabelEdit');
	button.addEventListener('click', this.getSelectAction(), true);
	return button;
};

RuleContainer.prototype.createDeleteButton = function () 
{
	var button = document.createElement('INPUT');
	button.type = 'BUTTON';
	button.value = chrome.i18n.getMessage('buttonLabelDelete');
	button.addEventListener('click', this.getDeleteAction(), true);
	return button;
};

RuleContainer.prototype.getDisableAction = function (inputButton)
{
	var rule = this.rule;
	return function (event)
	{
		rule.is_disabled = !rule.is_disabled;
		inputButton.value = (rule.is_disabled)?'OFF':'ON';
		inputButton.style.backgroundColor = (rule.is_disabled)?'#f8a':'#4f8';
		peer.saveObject(rule, function () {}, function () {});
		reloadBackground();
	}
};

RuleContainer.prototype.getSelectAction = function () 
{
	var self = this;
	return function () 
	{
		document.getElementById('rule_editor_alert').style.display = 'none';
		ruleEditor.selectRule(self.rule);
		deselectAll();
		self.liElement.className = 'selected';
	};
};

RuleContainer.prototype.getDeleteAction = function () 
{
	var self = this;
	return function () 
	{
		if (window.confirm(chrome.i18n.getMessage('dialogDelete'))) {
			peer.deleteObject(self.rule);
			self.liElement.parentNode.removeChild(self.liElement);
		}
	};
};


 var RuleEditor = function () 
 {
	this.rule = null;
	this.saveButton = document.getElementById('rule_editor_save_button');
	this.saveButton.addEventListener('click', this.getSaveAction(), true);
	this.addWordButton = document.getElementById('rule_editor_add_keyword_button');
	this.addWordButton.addEventListener('click', this.getAddWordAction(), true);
	document.getElementById('rule_editor_keyword').addEventListener('keydown', this.getAddWordByEnterAction(), true);
	this.alertDiv = document.getElementById('rule_editor_alert');

	document.getElementById('rule_editor_keyword_regexp_checkbox').addEventListener('click',RuleEditor.changeKeywordColor, false);
	RuleEditor.changeKeywordColor(null);
};
RuleEditor.changeKeywordColor = function (sender)
{
	document.getElementById('rule_editor_keyword').style.backgroundColor =
		(document.getElementById('rule_editor_keyword_regexp_checkbox').checked)?'#fdd':'#def';

}
 RuleEditor.prototype.getSaveAction = function () 
{
 	var self = this;
	
 	return function () 
	{
		self.saveRule();
	};
 }
 RuleEditor.prototype.selectRule = function (/* Rule */ rule) 
 {
 	this.rule = rule;
	document.getElementById('rule_editor_keywords').innerHTML = '';
	if (rule.rule_id && rule.rule_id > 0) 
	{
		document.getElementById('rule_editor_title').value = rule.title;
		document.getElementById('rule_editor_site_regexp').value = rule.site_regexp;
		document.getElementById('rule_editor_example_url').value = rule.example_url;
		document.getElementById('rule_editor_site_description').value = rule.site_description;
		document.getElementById('rule_editor_search_block_xpath').value = rule.search_block_xpath;
		document.getElementById('rule_editor_search_block_description').value = rule.search_block_description;
		document.getElementById('rule_editor_hide_block_xpath').value = rule.hide_block_xpath;
		document.getElementById('rule_editor_hide_block_description').value = rule.hide_block_description;
		document.getElementById('rule_editor_block_anyway').checked = rule.block_anyway;
	}
	for (var i=0, l=rule.words.length; i<l; i++) 
	{
		var word = rule.words[i];
		document.getElementById('rule_editor_keywords').appendChild(this.getWordElement(word));
	}
};

RuleEditor.prototype.showMessage = function (str)
{
	this.alertDiv.style.display = 'block';
	this.alertDiv.innerHTML = str;
};
RuleEditor.prototype.hideMessage = function ()
{
	this.alertDiv.style.display = 'none';
}

var reloadBackground = function ()
{	
	try {
		var bgWindow = chrome.extension.getBackgroundPage();
		bgWindow.reloadLists();
	}
	catch (ex)
	{
		alert(ex)
	}
}
RuleEditor.prototype.saveRule = function () 
{
	//Validation	
	var validateErrors = Rule.Validator.validate({
		title : document.getElementById('rule_editor_title').value,
		site_regexp : document.getElementById('rule_editor_site_regexp').value,
		example_url : document.getElementById('rule_editor_example_url').value,
		site_description : document.getElementById('rule_editor_site_description').value,
		search_block_xpath : document.getElementById('rule_editor_search_block_xpath').value,
		search_block_description : document.getElementById('rule_editor_search_block_description').value,
		hide_block_xpath : document.getElementById('rule_editor_hide_block_xpath').value,
		hide_block_description : document.getElementById('rule_editor_hide_block_description').value
	});
	if (validateErrors.length>0)
	{
		this.showMessage(validateErrors.join('<br/>'));
		return;
	}
	this.rule.title = document.getElementById('rule_editor_title').value;
	this.rule.site_regexp = document.getElementById('rule_editor_site_regexp').value;
	this.rule.example_url = document.getElementById('rule_editor_example_url').value;
	this.rule.site_description = document.getElementById('rule_editor_site_description').value;
	this.rule.search_block_xpath = document.getElementById('rule_editor_search_block_xpath').value;
	this.rule.search_block_description = document.getElementById('rule_editor_search_block_description').value;
	this.rule.hide_block_xpath = document.getElementById('rule_editor_hide_block_xpath').value;
	this.rule.hide_block_description = document.getElementById('rule_editor_hide_block_description').value;
	this.rule.block_anyway = document.getElementById('rule_editor_block_anyway').checked;
	var self = this;
	peer.saveObject(this.rule, function (){
		hideEmptyAlert();
		self.showMessage(chrome.i18n.getMessage('saveDone'));
		reloadBackground();
	});
	
}
RuleEditor.prototype.getWordElement = function (word) 
{
	
	var span = document.createElement('SPAN');
	span.className = 'word ' + ((word.is_regexp)?'regexp':'not_regexp');
	span.innerHTML = CustomBlockerUtil.escapeHTML(word.word);
	
	var deleteButton = document.createElement('A');
	deleteButton.className = 'deleteButton';
	deleteButton.href = 'javascript:void(0)'
	deleteButton.innerHTML = ' [x] '
	deleteButton.addEventListener('click', this.getDeleteWordAction(word, span), true);
	span.appendChild(deleteButton);
	
	return span;
};

RuleEditor.prototype.getDeleteWordAction = function (word, span) 
{
	var self = this;
	return function () 
	{
		span.parentNode.removeChild(span);
		wordPeer.deleteObject(word);
	}
};
RuleEditor.prototype.getAddWordByEnterAction = function () 
{
	var self = this;
	return function (event) 
	{
		if (13==event.keyCode) 
		{
			self.saveWord();
		}
	}
}
RuleEditor.prototype.getAddWordAction = function () 
{
	var self = this;
	return function () 
	{
		self.saveWord();
	}
};
RuleEditor.prototype.saveWord = function ()
{
	var self = this;
	var str = document.getElementById('rule_editor_keyword').value;
	if (!str || ''==str)
	{
		return;
	}
	var word = new Word();
	word.word = str;
	var checked = document.getElementById('rule_editor_keyword_regexp_checkbox').checked;
	word.is_regexp = checked;
	word.rule_id = self.rule.rule_id;
	wordPeer.saveObject(word, function () 
	{
		self.rule.words.push(word);
		document.getElementById('rule_editor_keywords').appendChild(self.getWordElement(word));
		document.getElementById('rule_editor_keyword').value = '';
	}, 
	function ()
	{
		alert("save failed")
		});
}
