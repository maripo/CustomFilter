var RuleEditorFrame = function () {
	// Init UI widgets
	this.title = document.getElementById('rule_editor_title');
	this.site_regexp = document.getElementById('rule_editor_site_regexp');
	this.specify_url_by_regexp_checkbox = document.getElementById('specify_url_by_regexp_checkbox');
	this.example_url = document.getElementById('rule_editor_example_url');
	this.site_description = document.getElementById('rule_editor_site_description');
	this.search_block_xpath = document.getElementById('rule_editor_search_block_xpath');
	this.search_block_css = document.getElementById('rule_editor_search_block_css');
	this.radio_search_css = document.getElementById('rule_editor_radio_search_css');
	this.radio_search_xpath = document.getElementById('rule_editor_radio_search_xpath');
	this.search_block_description = document.getElementById('rule_editor_search_block_description');
	this.hide_block_xpath = document.getElementById('rule_editor_hide_block_xpath');
	this.hide_block_css = document.getElementById('rule_editor_hide_block_css');
	this.radio_hide_css = document.getElementById('rule_editor_radio_hide_css');
	this.radio_hide_xpath = document.getElementById('rule_editor_radio_hide_xpath');
	this.hide_block_description = document.getElementById('rule_editor_hide_block_description');
	this.block_anyway = document.getElementById('rule_editor_block_anyway');
	this.block_anyway_false = document.getElementById('rule_editor_block_anyway_false');
	this.hide_detail = document.getElementById('rule_editor_hide_detail');

	document.getElementById('rule_editor_close_button').addEventListener('click', this.getCloseAction(), false);
	
	this.radio_hide_xpath.addEventListener('change', this.getRefreshPathSecionsAction(), false);
	this.radio_hide_css.addEventListener('change', this.getRefreshPathSecionsAction(), false);
	this.radio_search_xpath.addEventListener('change', this.getRefreshPathSecionsAction(), false);
	this.radio_search_css.addEventListener('change', this.getRefreshPathSecionsAction(), false);

	this.hide_block_xpath.addEventListener ('keyup',this.getRefreshHideBlockXPathAction(), false);
	this.search_block_xpath.addEventListener ('keyup',this.getRefreshSearchBlockXPathAction(), false);
	this.hide_block_xpath.addEventListener ('change',this.getRefreshHideBlockXPathAction(), false);
	this.search_block_xpath.addEventListener ('change',this.getRefreshSearchBlockXPathAction(), false);
	this.hide_block_css.addEventListener ('keyup',this.getRefreshHideBlockXPathAction(), false);
	this.search_block_css.addEventListener ('keyup',this.getRefreshSearchBlockXPathAction(), false);
	this.hide_block_css.addEventListener ('change',this.getRefreshHideBlockXPathAction(), false);
	this.search_block_css.addEventListener ('change',this.getRefreshSearchBlockXPathAction(), false);
	
	this.title.addEventListener('change', this.getChangedAction(), false);
	this.site_regexp.addEventListener('change', this.getChangedAction(), false);
	this.example_url.addEventListener('change', this.getChangedAction(), false);
	this.site_description.addEventListener('change', this.getChangedAction(), false);
	this.search_block_xpath.addEventListener('change', this.getChangedAction(), false);
	this.search_block_css.addEventListener('change', this.getChangedAction(), false);
	this.radio_search_css.addEventListener('change', this.getChangedAction(), false);
	this.radio_search_xpath.addEventListener('change', this.getChangedAction(), false);
	this.search_block_description.addEventListener('change', this.getChangedAction(), false);
	this.hide_block_xpath.addEventListener('change', this.getChangedAction(), false);
	this.hide_block_css.addEventListener('change', this.getChangedAction(), false);
	this.radio_hide_css.addEventListener('change', this.getChangedAction(), false);
	this.radio_hide_xpath.addEventListener('change', this.getChangedAction(), false);
	this.hide_block_description.addEventListener('change', this.getChangedAction(), false);
	this.block_anyway.addEventListener('change', this.getChangedAction(), false);
	this.block_anyway_false.addEventListener('change', this.getChangedAction(), false);
	this.specify_url_by_regexp_checkbox.addEventListener('change', this.getChangedAction(), false);

	document.getElementById('rule_editor_button_search_block_xpath').addEventListener('click',
			this.getPickPathAction("search_xpath"), false);
	document.getElementById('rule_editor_button_search_block_css').addEventListener('click',
			this.getPickPathAction("search_css"), false);
	document.getElementById('rule_editor_button_hide_block_xpath').addEventListener('click',
			this.getPickPathAction("hide_xpath"), false);
	document.getElementById('rule_editor_button_hide_block_css').addEventListener('click',
			this.getPickPathAction("hide_css"), false);

	document.getElementById('rule_editor_keyword_complete_matching_checkbox').addEventListener('click',RuleEditorFrame.changeKeywordColor, false);
	RuleEditorFrame.changeKeywordColor();
	var helpLinks = CustomBlockerUtil.getElementsByXPath('id("rule_editor_body")//a[@class="help"]');
	for (var i=0, l=helpLinks.length; i<l; i++) 
	{
		var link = helpLinks[i];
		link.addEventListener('click',CustomBlockerUtil.getShowHelpAction(link.href),false);
		link.href = 'javascript:void(0)';
	}
	var self = this;
	document.getElementById('rule_editor_keyword').addEventListener ('keydown',
		function(e) {
			if (KEY_CODE_RETURN==e.keyCode)  {
				self.addWord();
				/*
				if (window.ruleEditor.addWord(document.getElementById('rule_editor_keyword').value)) {
					document.getElementById('rule_editor_keyword').value = '';
				}
				*/
			}
		}, 
		true);
	document.getElementById('rule_editor_add_keyword_button').addEventListener ('click',
		function() {
			self.addWord();
			/*
			if (window.ruleEditor.addWord(document.getElementById('rule_editor_keyword').value)) {
				document.getElementById('rule_editor_keyword').value = '';
			}
			*/
		}, 
		true);
};
RuleEditorFrame.prototype.addWord = function () {
	var wordStr = document.getElementById('rule_editor_keyword').value;
	console.log("addWord word=" + wordStr);
	if (!wordStr || ''==wordStr) return; //Empty
	var word = new Word();
	
	word.word = wordStr;
	word.isNew = 'true';
	
	// Apply options
	word.is_regexp = 
		document.getElementById('rule_editor_keyword_regexp_checkbox').checked;
	word.is_complete_matching = 
		document.getElementById('rule_editor_keyword_complete_matching_checkbox').checked;
	word.is_case_sensitive = 
		document.getElementById('rule_editor_keyword_case_sensitive_checkbox').checked;
	word.is_include_href = 
		document.getElementById('rule_editor_keyword_include_href_checkbox').checked;
	
	if (word.is_regexp) {
		// Check if received RegExp is valid
		try {
			new RegExp(wordStr);
		} catch (ex) {
			alert(chrome.i18n.getMessage('invalidRegEx'));
			return false;
		}
	}
	
	word.dirty = true;
	
	var span = this.getWordElement(word)
	document.getElementById('rule_editor_keywords').appendChild(span);
	
	this.rule.words.push(word);
	
	if (this.rule.rule_id > 0)  {
		word.rule_id = this.rule.rule_id;
	}
	else  {
		word.rule_id=0;
	}

	document.getElementById('rule_editor_keyword').value = '';
	return;
}

RuleEditorFrame.prototype.getWordElement = function (word) 
{
	return CustomBlockerUtil.createWordElement(word, this.getWordDeleteAction(word));
};
/* Event handlers */
RuleEditorFrame.changeKeywordColor = function ()
{
	document.getElementById('rule_editor_keyword').style.backgroundColor =
		(document.getElementById('rule_editor_keyword_complete_matching_checkbox').checked)?'#fed3de':'#cdedf8';
}

RuleEditorFrame.prototype.setBlockAnywayStyle = function (on)
{
	this.hide_detail.style.display = (on)?'none':'block';
};
RuleEditorFrame.prototype.getPickPathAction = function (target) {
	//search_xpath, search_css, hide_xpath, hide_css
	return function () {
		postMessageToParent({command:"customblocker_pick_path", target:target});
	}
};
RuleEditorFrame.prototype.getRefreshPathSecionsAction = function () {
	var self = this;
	return function (event)
	{
		self.refreshPathSections();
		self.refreshXPathSelectedStyles();
	}
};
RuleEditorFrame.prototype.refreshPathSections = function () {
	var hideByXPath = document.getElementById('rule_editor_radio_hide_xpath').checked;
	var searchByXPath = document.getElementById('rule_editor_radio_search_xpath').checked;
	document.getElementById('rule_editor_section_hide_xpath').style.display = (hideByXPath)?'block':'none';
	document.getElementById('rule_editor_section_hide_css').style.display = (hideByXPath)?'none':'block';
	document.getElementById('rule_editor_section_search_xpath').style.display = (searchByXPath)?'block':'none';
	document.getElementById('rule_editor_section_search_css').style.display = (searchByXPath)?'none':'block';
};
RuleEditorFrame.prototype.refreshXPathSelectedStyles = function () {
	var options = {
			command:"customblocker_validate_selectors"
		};

	if (document.getElementById('rule_editor_radio_hide_xpath').checked) {
		options.hide_type = "xpath";
		options.hide_selector = document.getElementById('rule_editor_hide_block_xpath').value;
	} else {
		options.hide_type = "css"; 
		options.hide_selector = document.getElementById('rule_editor_hide_block_css').value;
	}
	if (document.getElementById('rule_editor_radio_search_xpath').checked) {
		options.search_type = "xpath";
		options.search_selector = document.getElementById('rule_editor_search_block_xpath').value;
	} else {
		options.search_type = "css"; 
		options.search_selector = document.getElementById('rule_editor_search_block_css').value;
	}
	postMessageToParent(options);
};
RuleEditorFrame.prototype.showSelectorValidationResult = function (data) {
	var searchCountLabel = data.searchType=="xpath" ? 
			document.getElementById('rule_editor_count_search_block_xpath'):document.getElementById('rule_editor_count_search_block_css');
	if (data.hideValid) {
		document.getElementById('rule_editor_alert_search_block_xpath').display = "none";
		searchCountLabel.innerHTML = data.searchCount;
	} else {
		searchCountLabel.innerHTML = "-";
		document.getElementById('rule_editor_alert_search_block_xpath').display = "block";
		document.getElementById('rule_editor_alert_search_block_xpath').innerHTML = 
			"Invalid " + (data.searchType=="xpath" ? "XPath":"CSS selector");
	}
	var hideCountLabel = data.hideType=="xpath" ? 
			document.getElementById('rule_editor_count_hide_block_xpath'):document.getElementById('rule_editor_count_hide_block_css');
	if (data.hideValid) {
		document.getElementById('rule_editor_alert_hide_block_xpath').display = "none";
		hideCountLabel.innerHTML = data.hideCount;
	} else {
		hideCountLabel.innerHTML = "-";
		document.getElementById('rule_editor_alert_hide_block_xpath').display = "block";
		document.getElementById('rule_editor_alert_hide_block_xpath').innerHTML = 
			"Invalid " + (data.hideType=="xpath" ? "XPath":"CSS selector");
	}
}
RuleEditorFrame.prototype.getCloseAction = function () {
	// TODO close (call function in parent window)
	return function () {
		
	}
};
RuleEditorFrame.prototype.getWordDeleteAction = function (word) {

	var self = this;
	return function (span) {
		span.parentNode.removeChild(span);
		word.deleted = true;
		word.dirty = true;
	};
}
RuleEditorFrame.prototype.getChangedAction = function () {
	// TODO
	return function () {
		
	}
}
RuleEditorFrame.prototype.getRefreshHideBlockXPathAction = function () {
	var self = this;
	return function (event) {
		self.refreshXPathSelectedStyles();
	}
}
RuleEditorFrame.prototype.getRefreshSearchBlockXPathAction = function () {
	var self = this;
	return function () {
		self.refreshXPathSelectedStyles();
	}
};
RuleEditorFrame.prototype.renderRule = function (rule) {
	console.log("Rule=");
	this.rule = rule;
	this.rule.changed = false;
	console.log(rule);
	document.getElementById('rule_editor_title').value = rule.title;

	for (var i = 0, l = rule.words.length; i < l; i++) 
	{
		var word = rule.words[i];
		var span = CustomBlockerUtil.createWordElement(word, this.getWordDeleteAction(word));
		document.getElementById('rule_editor_keywords').appendChild(span);
	}

	if (rule.rule_id && rule.rule_id > 0) 
	{
		this.title.value = rule.title;
		this.site_regexp.value = rule.site_regexp;
		this.example_url.value = rule.example_url;
		this.site_description.value = rule.site_description;
		this.search_block_xpath.value = rule.search_block_xpath;
		this.search_block_css.value = rule.search_block_css;
		((rule.search_block_by_css)?this.radio_search_css:this.radio_search_xpath).checked = true;
		this.search_block_description.value  = rule.search_block_description;
		this.hide_block_xpath.value = rule.hide_block_xpath;
		this.hide_block_css.value = rule.hide_block_css;
		((rule.hide_block_by_css)?this.radio_hide_css:this.radio_hide_xpath).checked = true;
		this.hide_block_description.value = rule.hide_block_description;
		((rule.block_anyway)?this.block_anyway:this.block_anyway_false).checked = true;
		this.specify_url_by_regexp_checkbox.checked = rule.specify_url_by_regexp;

		this.setBlockAnywayStyle(this.block_anyway.checked);
		document.getElementById('rule_editor_keyword').focus();
	}
	else 
	{
		this.site_regexp.value = location.href;
		this.site_description.value = document.title;
		this.title.value = document.title;
		this.example_url.value = location.href;
		this.block_anyway_false.checked = true;
	}
	
};

var editor = new RuleEditorFrame();

window.addEventListener("message", receiveMessage, false);

function receiveMessage(event) {
	console.log(event);
	switch (event.data.command) {
	case "customblocker_init": {
		if (event.data.rule) {
			editor.renderRule(event.data.rule);
		}
		break;
	}
	case "customblocker_validate_selectors_result": {
		editor.showSelectorValidationResult(event.data);
		break;
	}
	}
	if (event.data.command="customblocker_init" && event.data.rule) {
		editor.renderRule(event.data.rule);
	}
}

function postMessageToParent (message) {
	window.parent.postMessage(message, "*");
	
}
function initRuleEditor () {
	console.log("initRuleEditor");
	postMessageToParent({command:"customblocker_frame_ready"});
}
initRuleEditor();