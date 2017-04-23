
var ruleList = new Array();
var appliedRuleMap = new Array();
var ruleContainerList = new Array();

var ruleEditor;

var peer = RulePeer.getInstance();
var wordPeer = WordPeer.getInstance();

function onStart () 
{
	// Localize
	document.getElementById('help_link').href = 'help_' + chrome.i18n.getMessage('extLocale') + '.html';
	document.getElementById('help_link_empty').href = 'help_' + chrome.i18n.getMessage('extLocale') + '.html';
	document.getElementById('search_box').addEventListener('change', search, false);
	document.getElementById('search_box').addEventListener('keyup', search, false);

	document.getElementById('rule_editor_radio_search_xpath').addEventListener('change', refreshPathSections, false);
	document.getElementById('rule_editor_radio_search_css').addEventListener('change', refreshPathSections, false);
	document.getElementById('rule_editor_radio_hide_xpath').addEventListener('change', refreshPathSections, false);
	document.getElementById('rule_editor_radio_hide_css').addEventListener('change', refreshPathSections, false);

	document.getElementById('buttonBadgeOn').addEventListener('change', refreshBadgeEnabled, false);
	document.getElementById('buttonBadgeOff').addEventListener('change', refreshBadgeEnabled, false);
	
	if ("true"==localStorage.badgeDisabled) {
		document.getElementById('buttonBadgeOff').checked = true;
	} else {
		document.getElementById('buttonBadgeOn').checked = true;
		
	}
	
	ruleEditor = new RuleEditor();
	peer.createTable(createWordTable);
	CustomBlockerUtil.localize();
}

function refreshBadgeEnabled () {
	var isBadgeOn = document.getElementById('buttonBadgeOn').checked;
    localStorage.badgeDisabled = (isBadgeOn)?"false":"true";
}

function createWordTable () 
{
	wordPeer.createTable(loadLists);
}

function loadLists () 
{
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
	}
	// Relate words with rules
	for (var i = 0, l = wordList.length; i < l; i++) 
	{
		var rule = ruleMap[wordList[i].rule_id];
		if (rule) 
		{
			rule.words.push(wordList[i]);
		}
	}
	renderRules();
	showCount();
}
var prevFilterString = null;
function renderRules ()
{
	for (var i = 0, l = ruleContainerList.length; i < l; i++) 
	{
		var container = ruleContainerList[i];
		var element = container.getLiElement();
		container.applyClassName(i);
		document.getElementById('ruleList').appendChild(element);
	}
}

function search ()
{
	applyFilter(document.getElementById('search_box').value);
}

function applyFilter (filterString)
{
	if (prevFilterString == filterString) return;
	prevFilterString = filterString;
	var visibleIndex = 0;
	for (var i = 0, l = ruleContainerList.length; i < l; i++)
	{
		var container = ruleContainerList[i];
		var matched = isMatched(container.rule, filterString);
		container.filtered = !matched;
		container.applyClassName(visibleIndex);
		if (matched) visibleIndex++;
	}
	showCount();
}
function showCount ()
{
	var visibleCount = 0;
	for (var i = 0, l = ruleContainerList.length; i < l; i++)
	{
		if (!ruleContainerList[i].filtered) visibleCount ++;
	}
	document.getElementById('activeRuleCount').innerHTML = visibleCount;
	document.getElementById('totalRuleCount').innerHTML = ruleContainerList.length;
}
function isMatched (rule, filterString)
{
	if (null==filterString || ''==filterString) return true;
	filterString = filterString.toLowerCase();
	return (isMatchedByRule(rule, filterString) || isMatchedByWords(rule, filterString));
}

function isMatchedByRule (rule, filterString)
{
	return (
			rule.title.toLowerCase().indexOf(filterString)>=0 ||
			rule.site_regexp.toLowerCase().indexOf(filterString)>=0 ||
			rule.example_url.toLowerCase().indexOf(filterString)>=0
			);

}
function isMatchedByWords (rule, filterString)
{
	if (!rule.words) return false;
	for (var i=0; i<rule.words.length; i++)
	{
		if (rule.words[i].word.toLowerCase().indexOf(filterString)>=0)
			return true;
	}
	return false;
}

var RuleContainer = function (rule) 
{
	this.rule = rule;
	this.liElement = null;
	this.filtered = false;
};
RuleContainer.prototype.deselect = function ()
{
	this.selected = false;
}
RuleContainer.prototype.applyClassName = function (index)
{
	if (this.filtered) this.liElement.className = 'filtered';
	else this.liElement.className = (this.selected)?'selected':((index%2==0)?'odd':'even');
}
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
	
	titleDiv.innerHTML = CustomBlockerUtil.shorten(this.rule.title, 42);
	
	
	var urlDiv = document.createElement('DIV');
	urlDiv.className = 'url';
	urlDiv.innerHTML = CustomBlockerUtil.shorten(this.rule.site_regexp,36);
	
	var keywordsDiv = document.createElement('DIV');
	keywordsDiv.className = 'keywords';
	
	var keywords = new Array();
	if (this.rule.block_anyway)
	{
		var span = document.createElement('SPAN');
		span.innerHTML = chrome.i18n.getMessage('blockAnyway');
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
	
	return this.liElement;
};

function deselectAll () 
{
	var visibleIndex = 0;
	for (var i=0, l=ruleContainerList.length; i<l; i++)
	{
		ruleContainerList[i].deselect();
		ruleContainerList[i].applyClassName(visibleIndex);
		if (!ruleContainerList[i].filtered) visibleIndex++;
	}	
}

RuleContainer.prototype.createDisableBox = function () 
{
	var span = document.createElement('SPAN');
	var input = document.createElement('INPUT');
	input.type = 'BUTTON';
	input.value = (this.rule.is_disabled)?'OFF':'ON';
	input.className = (this.rule.is_disabled)?'uiButton buttonOff':'uiButton buttonOn';
	span.appendChild(input);
	input.addEventListener('click', this.getDisableAction(input), true);
	return span;
}
RuleContainer.prototype.createSelectButton = function () 
{
	var button = document.createElement('INPUT');
	button.type = 'BUTTON';
	button.className = 'uiButton buttonEdit';
	button.value = chrome.i18n.getMessage('buttonLabelEdit');
	button.addEventListener('click', this.getSelectAction(), true);
	return button;
};

RuleContainer.prototype.createDeleteButton = function () 
{
	var button = document.createElement('INPUT');
	button.type = 'BUTTON';
	button.className = 'uiButton buttonDelete';
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
		inputButton.className = (rule.is_disabled)?'uiButton buttonOff':'uiButton buttonOn';
		// set UUIDs
		if (CustomBlockerUtil.isEmpty(rule.user_identifier))
		{
			rule.user_identifier = UUID.generate();
		}
		if (CustomBlockerUtil.isEmpty(rule.global_identifier))
		{
			rule.global_identifier = UUID.generate();
		}
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
		self.selected = true;
		self.applyClassName();
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
			removeElement (self);
			showCount();
			reloadBackground();
		}
	};
};

function removeElement (element)
{

	for (var i=0; i<ruleContainerList.length; i++)
	{
		if (ruleContainerList[i]==element)
		{
			ruleContainerList.splice(i, 1);
			return;
		}
	}
}

function refreshPathSections ()
{
	var hideByXPath = document.getElementById('rule_editor_radio_hide_xpath').checked;
	var searchByXPath = document.getElementById('rule_editor_radio_search_xpath').checked;
	document.getElementById('rule_editor_section_hide_xpath').style.display = (hideByXPath)?'block':'none';
	document.getElementById('rule_editor_section_hide_css').style.display = (hideByXPath)?'none':'block';
	document.getElementById('rule_editor_section_search_xpath').style.display = (searchByXPath)?'block':'none';
	document.getElementById('rule_editor_section_search_css').style.display = (searchByXPath)?'none':'block';
};

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
	document.getElementById('rule_editor_block_anyway').addEventListener('change',RuleEditor.setVisibilityOfConditionDetail, false);
	document.getElementById('rule_editor_block_anyway_false').addEventListener('change',RuleEditor.setVisibilityOfConditionDetail, false);
	RuleEditor.changeKeywordColor(null);
};
RuleEditor.changeKeywordColor = function (sender)
{
	document.getElementById('rule_editor_keyword').style.backgroundColor =
		(document.getElementById('rule_editor_keyword_regexp_checkbox').checked)?'#fdd!important':'#def!important';

}

RuleEditor.setVisibilityOfConditionDetail = function () {
	document.getElementById('rule_editor_hide_detail').style.display = 
		(document.getElementById('rule_editor_block_anyway').checked)?'none':'block';
}

RuleEditor.prototype.getSaveAction = function () {
	var self = this;
	
	return function () 
	{
		self.saveRule();
	};
}
RuleEditor.prototype.selectRule = function (/* Rule */ rule) {
	this.rule = rule;
	document.getElementById('rule_editor_keywords').innerHTML = '';
	if (rule.rule_id && rule.rule_id > 0) 
	{
		document.getElementById('rule_editor_title').value = rule.title;
		document.getElementById('rule_editor_site_regexp').value = rule.site_regexp;
		document.getElementById('rule_editor_example_url').value = rule.example_url;
		document.getElementById('rule_editor_site_description').value = rule.site_description;
		document.getElementById('rule_editor_search_block_xpath').value = rule.search_block_xpath;
		document.getElementById('rule_editor_search_block_css').value = rule.search_block_css;
		(document.getElementById('rule_editor_radio_search_'+((rule.search_block_by_css)?'css':'xpath'))).checked 
			= true;
		document.getElementById('rule_editor_search_block_description').value = rule.search_block_description;
		document.getElementById('rule_editor_hide_block_xpath').value = rule.hide_block_xpath;
		document.getElementById('rule_editor_hide_block_css').value = rule.hide_block_css;
		(document.getElementById('rule_editor_radio_hide_'+((rule.hide_block_by_css)?'css':'xpath'))).checked 
			= true;
		
		document.getElementById('rule_editor_hide_block_description').value = rule.hide_block_description;
		(document.getElementById((rule.block_anyway)?'rule_editor_block_anyway':'rule_editor_block_anyway_false')).checked = true;
		document.getElementById('rule_editor_hide_detail').style.display = (rule.block_anyway)?'none':'block';
		document.getElementById('specify_url_by_regexp_checkbox').checked = rule.specify_url_by_regexp;
		refreshPathSections();
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

RuleEditor.prototype.saveRule = function () 
{
	//Validation	
	var validateErrors = Rule.Validator.validate({
		title : document.getElementById('rule_editor_title').value,
		site_regexp : document.getElementById('rule_editor_site_regexp').value,
		example_url : document.getElementById('rule_editor_example_url').value,
		site_description : document.getElementById('rule_editor_site_description').value,
		search_block_xpath : document.getElementById('rule_editor_search_block_xpath').value,
		search_block_css : document.getElementById('rule_editor_search_block_css').value,
		search_block_description : document.getElementById('rule_editor_search_block_description').value,
		hide_block_xpath : document.getElementById('rule_editor_hide_block_xpath').value,
		hide_block_css : document.getElementById('rule_editor_hide_block_css').value,
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
	this.rule.search_block_css = document.getElementById('rule_editor_search_block_css').value;
	this.rule.search_block_by_css = document.getElementById('rule_editor_radio_search_css').checked;
	this.rule.search_block_description = document.getElementById('rule_editor_search_block_description').value;
	this.rule.hide_block_xpath = document.getElementById('rule_editor_hide_block_xpath').value;
	this.rule.hide_block_css = document.getElementById('rule_editor_hide_block_css').value;
	this.rule.hide_block_by_css = document.getElementById('rule_editor_radio_hide_css').checked;
	this.rule.hide_block_description = document.getElementById('rule_editor_hide_block_description').value;
	this.rule.block_anyway = document.getElementById('rule_editor_block_anyway').checked;
	this.rule.specify_url_by_regexp = document.getElementById('specify_url_by_regexp_checkbox').checked;
	var self = this;
	// set UUIDs
	if (CustomBlockerUtil.isEmpty(this.rule.user_identifier))
	{
		this.rule.user_identifier = UUID.generate();
	}
	if (CustomBlockerUtil.isEmpty(this.rule.global_identifier))
	{
		this.rule.global_identifier = UUID.generate();
	}
	peer.saveObject(this.rule, function (){
		hideEmptyAlert();
		self.showMessage(chrome.i18n.getMessage('saveDone'));
		reloadBackground();
	});
	
}
RuleEditor.prototype.getWordElement = function (word) 
{
	var span = document.createElement('SPAN');
	span.innerHTML = CustomBlockerUtil.escapeHTML(word.word);
	span.className = 'word ' 
		+ ((word.is_regexp)?'regexp ':'not_regexp ')
		+ ((word.is_regexp)?'complete_matching':'not_complete_matching');
	
	var deleteButton = CustomBlockerUtil.createDeleteButton();
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
window.onload = onStart;
