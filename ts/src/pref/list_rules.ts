let allRules = [] as [Rule];
let ruleContainerList = new Array();
let ruleEditor: PrefRuleEditor;

function manualMigration () {
	chrome.storage.local.get(["migrationDone"], function(result) {
		if (!result["migrationDone"]) {
			document.getElementById("manualMigrationSection").style.display = "block";
			document.getElementById("manualMigrationLink").addEventListener("click", function(){
				let bgWindow = chrome.extension.getBackgroundPage();
				bgWindow.manualDataMigration();
			}, false);
		}
	});
}

function onStart () {
	// processPage
	document.getElementById('help_link').setAttribute("href", 'help_' + chrome.i18n.getMessage('extLocale') + '.html');
	document.getElementById('donate_link').setAttribute("href", 'help_' + chrome.i18n.getMessage('extLocale') + '.html#donate');
	document.getElementById('help_link_empty').setAttribute("href", 'help_' + chrome.i18n.getMessage('extLocale') + '.html');
	document.getElementById('search_box').addEventListener('change', search, false);
	document.getElementById('search_box').addEventListener('keyup', search, false);

	document.getElementById('rule_editor_radio_search_xpath').addEventListener('change', refreshPathSections, false);
	document.getElementById('rule_editor_radio_search_css').addEventListener('change', refreshPathSections, false);
	document.getElementById('rule_editor_radio_hide_xpath').addEventListener('change', refreshPathSections, false);
	document.getElementById('rule_editor_radio_hide_css').addEventListener('change', refreshPathSections, false);

	document.getElementById('buttonBadgeOn').addEventListener('change', refreshBadgeEnabled, false);
	document.getElementById('buttonBadgeOff').addEventListener('change', refreshBadgeEnabled, false);

	if ("true"==localStorage.badgeDisabled) {
		document.getElementById('buttonBadgeOff').setAttribute("checked", "true");
	} else {
		document.getElementById('buttonBadgeOn').setAttribute("checked", "true");

	}

	ruleEditor = new PrefRuleEditor();
	CustomBlockerUtil.processPage();
	ruleEditor.init();
	window.setTimeout(manualMigration, 1000);
}

function refreshBadgeEnabled () {
	let isBadgeOn = (document.getElementById('buttonBadgeOn') as HTMLInputElement).checked;
		localStorage.badgeDisabled = (isBadgeOn)?"false":"true";
}

function showEmptyAlert () {
	document.getElementById('js_rule-list').style.display = 'none';
	document.getElementById('ruleEmptyAlert').style.display = 'block';
}
function hideEmptyAlert () {
	document.getElementById('js_rule-list').style.display = 'block';
	document.getElementById('ruleEmptyAlert').style.display = 'none';
}

let prevFilterString = null;

function renderRules (): void {
	for (let container of ruleContainerList) {
		let element = container.getLiElement();
		container.applyClassName();
		document.getElementById('js_rule-list').appendChild(element);
	}
}

function search () {
	applyFilter((document.getElementById('search_box')as HTMLInputElement).value);
}

function applyFilter (filterString: string) {
	if (prevFilterString == filterString) return;
	prevFilterString = filterString;
	for (let i = 0, l = ruleContainerList.length; i < l; i++) {
		let container = ruleContainerList[i];
		let matched = isMatched(container.rule, filterString);
		container.filtered = !matched;
		container.applyClassName();
	}
	showCount();
}

function showCount ():void {
	let visibleCount = 0;
	for (let i = 0, l = ruleContainerList.length; i < l; i++)
	{
		if (!ruleContainerList[i].filtered) visibleCount ++;
	}
	document.getElementById('activeRuleCount').innerHTML = String(visibleCount);
	document.getElementById('totalRuleCount').innerHTML = String(ruleContainerList.length);
}

function isMatched (rule:Rule, filterString:string) {
	if (null==filterString || ''==filterString) return true;
	filterString = filterString.toLowerCase();
	return (isMatchedByRule(rule, filterString) || isMatchedByWords(rule, filterString));
}

function isMatchedByRule (rule:Rule, filterString:string) {
	return (
			rule.title.toLowerCase().indexOf(filterString)>=0 ||
			rule.site_regexp.toLowerCase().indexOf(filterString)>=0 ||
			rule.example_url.toLowerCase().indexOf(filterString)>=0
			);
}

function isMatchedByWords (rule:Rule, filterString:string) {
	if (!rule.words) return false;
	for (let i=0; i<rule.words.length; i++) {
		if (rule.words[i].word.toLowerCase().indexOf(filterString)>=0)
			return true;
	}
	return false;
}


function deselectAll ():void {
	for (let container of ruleContainerList) {
		container.deselect();
		container.applyClassName();
	}
}

function removeElement (element):void {
	for (let i=0; i<ruleContainerList.length; i++) {
		if (ruleContainerList[i]==element) {
			ruleContainerList.splice(i, 1);
			return;
		}
	}
}
class RuleContainer {
	rule: Rule;
	liElement: HTMLElement;
	filtered: boolean;
	selected: boolean;
	disableBox: HTMLElement;
	constructor (rule: Rule)
	{
		this.rule = rule;
		this.liElement = null;
		this.filtered = false;
	}
	getKeywordClass(suffix):string {
		return 'keyword keyword--' + suffix;
	}
	deselect ():void
	{
		this.selected = false;
	}
	applyClassName () {
		this.liElement.className = (this.filtered)? 'rule-list__item rule-list__item--filtered filtered':'rule-list__item';
	}

	getLiElement (): HTMLElement {
		if (this.liElement) return this.liElement;
		this.liElement = document.createElement('LI');

		let exampleLink = document.createElement('INPUT');
		exampleLink.className = 'ui-button exampleUrl';
		exampleLink.setAttribute("value", "link");
		//exampleLink.setAttribute("href", this.rule.example_url);
		exampleLink.setAttribute("type", "button");
		exampleLink.addEventListener("click", ()=>{
			window.open(this.rule.example_url);
		});
		this.liElement.addEventListener('click', this.getSelectAction(), false);
		let buttonContainer = document.createElement('DIV');
		buttonContainer.className = 'button-container';
		buttonContainer.appendChild(exampleLink);
		buttonContainer.appendChild(this.createSelectButton());
		buttonContainer.appendChild(this.createDeleteButton());
		this.disableBox = this.createDisableBox();
		buttonContainer.appendChild(this.disableBox);

		this.liElement.appendChild(buttonContainer);

		let informationDiv = document.createElement('DIV');
		informationDiv.className = 'rule-list__item__information';

		this.liElement.appendChild(informationDiv);

		let titleDiv = document.createElement('DIV');
		titleDiv.className = 'title';

		titleDiv.innerHTML = CustomBlockerUtil.shorten(this.rule.title, 42);

		let urlDiv = document.createElement('DIV');
		urlDiv.className = 'url';
		urlDiv.innerHTML = CustomBlockerUtil.shorten(this.rule.site_regexp,36);

		let keywordsDiv = document.createElement('DIV');
		keywordsDiv.className = 'keywords';

		let keywords = new Array();
		if (this.rule.block_anyway) {
			let span = document.createElement('SPAN');
			span.innerHTML = chrome.i18n.getMessage('blockAnyway');
			span.className = this.getKeywordClass("block-anyway");
			keywordsDiv.appendChild(span);
		} else {
			for (let word of this.rule.words) {
				let keywordSpan = document.createElement('SPAN');
				keywordSpan.className = (word.is_regexp)?this.getKeywordClass("regex"):this.getKeywordClass("normal");
				keywordSpan.innerHTML = word.word
				keywordsDiv.appendChild(keywordSpan);
				keywordsDiv.appendChild(document.createTextNode(" "));
			}
			for (let group of this.rule.wordGroups) {
				let keywordSpan = document.createElement('SPAN');
				keywordSpan.className = this.getKeywordClass("group");
				keywordSpan.innerHTML = group.name;
				keywordsDiv.appendChild(keywordSpan);
				keywordsDiv.appendChild(document.createTextNode(" "));
			}
		}

		informationDiv.appendChild(titleDiv);
		informationDiv.appendChild(urlDiv);
		informationDiv.appendChild(keywordsDiv);

		let favicon = document.createElement('IMG');
		let hrefValue = (this.rule.example_url)? 'chrome://favicon/' + this.rule.example_url : chrome.extension.getURL('img/world.png');
		favicon.setAttribute("src", hrefValue);
		favicon.className = 'favicon';
		informationDiv.appendChild(favicon);

		// informationDiv.appendChild(exampleLink);

		return this.liElement;
	}
	createDisableBox (): HTMLElement
	{
		let span = document.createElement('SPAN');
		let input = document.createElement('INPUT') as HTMLInputElement;
		input.type = 'BUTTON';
		input.value = (this.rule.is_disabled)?'OFF':'ON';
		input.className = (this.rule.is_disabled)?'ui-button buttonOff':'ui-button buttonOn';
		span.appendChild(input);
		input.addEventListener('click', this.getDisableAction(input), true);
		return span;
	}
	createSelectButton (): HTMLInputElement {
		let button = document.createElement('INPUT') as HTMLInputElement;
		button.type = 'BUTTON';
		button.className = 'ui-button buttonEdit';
		button.value = chrome.i18n.getMessage('buttonLabelEdit');
		button.addEventListener('click', this.getSelectAction(), true);
		return button;
	}
	createDeleteButton (): HTMLInputElement {
		let button = document.createElement('INPUT') as HTMLInputElement;
		button.type = 'BUTTON';
		button.className = 'ui-button buttonDelete';
		button.value = chrome.i18n.getMessage('buttonLabelDelete');
		button.addEventListener('click', this.getDeleteAction(), true);
		return button;
	}

	getDisableAction (inputButton: HTMLInputElement) {
		return (event) => {
				event.stopPropagation();
				let rule = this.rule
				cbStorage.toggleRule(rule, function() {
				inputButton.value = (rule.is_disabled)?'OFF':'ON';
				inputButton.className = (rule.is_disabled)?'ui-button buttonOff':'ui-button buttonOn';
				});
		}
	}
	getSelectAction () {
		return (event) => {
			// event.stopPropagation();
			document.getElementById('rule_editor_alert').style.display = 'none';
			ruleEditor.selectRule(this.rule);
			deselectAll();
			this.selected = true;
			this.applyClassName();
		};
	}
	getDeleteAction () {
		return (event) => {
			event.stopPropagation();
			if (window.confirm(chrome.i18n.getMessage('dialogDelete'))) {
				cbStorage.deleteRule(this.rule, function(){});
				this.liElement.parentNode.removeChild(this.liElement);
				removeElement(this);
				showCount();
				reloadBackground();
			}
		};
	}
}

function refreshPathSections (): void {
	let hideByXPath = (document.getElementById('rule_editor_radio_hide_xpath') as HTMLInputElement).checked;
	let searchByXPath = (document.getElementById('rule_editor_radio_search_xpath') as HTMLInputElement).checked;
	document.getElementById('rule_editor_section_hide_xpath').style.display = (hideByXPath)?'block':'none';
	document.getElementById('rule_editor_section_hide_css').style.display = (hideByXPath)?'none':'block';
	document.getElementById('rule_editor_section_search_xpath').style.display = (searchByXPath)?'block':'none';
	document.getElementById('rule_editor_section_search_css').style.display = (searchByXPath)?'none':'block';
};

let reloadBackground = function () {
	try {
		let bgWindow = chrome.extension.getBackgroundPage();
		bgWindow.reloadLists();
	}
	catch (ex) {
		alert(ex)
	}
}

class PrefRuleEditor {
	private rule: Rule;
	alertDiv: HTMLElement;
	saveButton: HTMLInputElement;
	wordEditor: WordEditor;
	wordGroups: [WordGroup];
	group_picker:WordGroupPicker;
	constructor ()	{
		this.rule = null;
		this.saveButton = document.getElementById('rule_editor_save_button') as HTMLInputElement;
		this.saveButton.addEventListener('click', this.getSaveAction(), true);

		this.alertDiv = document.getElementById('rule_editor_alert');
		document.getElementById('rule_editor_block_anyway').addEventListener('change',PrefRuleEditor.setVisibilityOfConditionDetail, false);
		document.getElementById('rule_editor_block_anyway_false').addEventListener('change',PrefRuleEditor.setVisibilityOfConditionDetail, false);


		this.wordEditor = new WordEditor();
		// Add WordEditor handlers
		let self = this;
		this.wordEditor.addWordHandler = (word:Word) => {
			word.rule_id = self.rule.rule_id;
			cbStorage.addWordToRule(self.rule, word);
		};
		this.wordEditor.deleteWordHandler = (word:Word) => {
			cbStorage.removeWordFromRule(self.rule, word);
		};
	}

	init () {
		let self = this;
		this.group_picker = new WordGroupPicker(document.getElementById("select_word_groups") as HTMLSelectElement);

		this.group_picker.onSelectGroup = (group:WordGroup) => {
			console.log("list_rules group selected.");
			this.rule.wordGroups.push(group);
			this.renderGroups(this.rule.wordGroups);
			this.group_picker.refresh();
		};
		cbStorage.loadAll (
			function (rules:[Rule], groups:[WordGroup]) {
				if (!rules || rules.length==0) {
					showEmptyAlert();
				}
				allRules = rules;
				self.wordGroups = groups;
				for (let i=0; i<allRules.length; i++) {
					ruleContainerList.push(new RuleContainer(allRules[i]));
				}
				self.group_picker.setGroups(groups);
				self.group_picker.refresh();
				renderRules();
				showCount();
			});
	}

	removeGroup (group:WordGroup) {
		for (let groupId=0; groupId < this.rule.wordGroups.length; groupId++) {
			if (this.rule.wordGroups[groupId].global_identifier == group.global_identifier) {
				this.rule.wordGroups.splice(groupId, 1);
				this.renderGroups(this.rule.wordGroups);
				this.group_picker.refresh();
				return;
			}
		}
	}

	static setVisibilityOfConditionDetail () {
		document.getElementById('rule_editor_hide_detail').style.display =
			((document.getElementById('rule_editor_block_anyway') as HTMLInputElement).checked)?'none':'block';
	}
	getSaveAction () {
		let self = this;

		return () => {
			self.saveRule();
		};
	}

	selectRule (rule: Rule) {
		this.rule = rule;
		this.wordEditor.setWords(rule.words as [Word]);
		(document.getElementById('rule_editor_title') as HTMLInputElement).value = rule.title;
		(document.getElementById('rule_editor_site_regexp') as HTMLInputElement).value = rule.site_regexp;
		(document.getElementById('rule_editor_example_url') as HTMLInputElement).value = rule.example_url;
		(document.getElementById('rule_editor_search_block_xpath') as HTMLInputElement).value = rule.search_block_xpath;
		(document.getElementById('rule_editor_search_block_css') as HTMLInputElement).value = rule.search_block_css;
		let searchRadio = document.getElementById('rule_editor_radio_search_'+((rule.search_block_by_css)?'css':'xpath')) as HTMLInputElement
		searchRadio.checked	 = true;
		(document.getElementById('rule_editor_hide_block_xpath') as HTMLInputElement).value = rule.hide_block_xpath;
		(document.getElementById('rule_editor_hide_block_css') as HTMLInputElement).value = rule.hide_block_css;
		let hideRadio = document.getElementById('rule_editor_radio_hide_'+((rule.hide_block_by_css)?'css':'xpath')) as HTMLInputElement
		hideRadio.checked = true;

		let blockAnywayCheckbox = document.getElementById((rule.block_anyway)?'rule_editor_block_anyway':'rule_editor_block_anyway_false') as HTMLInputElement
		blockAnywayCheckbox.checked = true;
		document.getElementById('rule_editor_hide_detail').style.display = (rule.block_anyway)?'none':'block';
		(document.getElementById('specify_url_by_regexp_checkbox') as HTMLInputElement).checked = rule.specify_url_by_regexp;

		let select = document.getElementById("select_word_groups") as HTMLSelectElement;
		let self = this;
		select.addEventListener ("change", () => {
			let value = (select.getElementsByTagName("option")[select.selectedIndex] as HTMLOptionElement).value;
			console.log(select.selectedIndex);
		});

		this.group_picker.setRule(this.rule);
		this.group_picker.refresh();
		this.renderGroups(this.rule.wordGroups);
		refreshPathSections();
	}

	private renderGroups (groups:WordGroup[]) {
		document.getElementById("rule_editor_keyword_groups").innerHTML = "";
		groups.forEach((group)=>{
			CustomBlockerUtil.createWordGroupElement(group, ()=>{ this.removeGroup(group) });
			document.getElementById("rule_editor_keyword_groups").appendChild(
				CustomBlockerUtil.createWordGroupElement(group, ()=>{ this.removeGroup(group) })
			);
		});
	}
	private createOption (label:string, value:string): HTMLElement {
		let option = document.createElement("option");
		option.innerHTML = label;
		if (value) {
			option.value = value;
		}
		return option;
	}

	showMessage (str: string): void {
		this.alertDiv.style.display = 'block';
		this.alertDiv.innerHTML = str;
	}

	hideMessage (): void {
		this.alertDiv.style.display = 'none';
	}

	saveRule () {
		//Validation
		let validateErrors = cbStorage.validateRule({
			title : (document.getElementById('rule_editor_title') as HTMLInputElement).value,
			site_regexp : (document.getElementById('rule_editor_site_regexp') as HTMLInputElement).value,
			example_url : (document.getElementById('rule_editor_example_url') as HTMLInputElement).value,
			search_block_xpath : (document.getElementById('rule_editor_search_block_xpath') as HTMLInputElement).value,
			search_block_css : (document.getElementById('rule_editor_search_block_css') as HTMLInputElement).value,
			hide_block_xpath : (document.getElementById('rule_editor_hide_block_xpath') as HTMLInputElement).value,
			hide_block_css : (document.getElementById('rule_editor_hide_block_css') as HTMLInputElement).value,
		});
		if (validateErrors.length > 0) {
			// Validation Error
			this.showMessage(validateErrors.join('<br/>'));
			return;
		}
		// Validation OK
		this.rule.title = (document.getElementById('rule_editor_title') as HTMLInputElement).value;
		this.rule.site_regexp = (document.getElementById('rule_editor_site_regexp') as HTMLInputElement).value;
		this.rule.example_url = (document.getElementById('rule_editor_example_url') as HTMLInputElement).value;
		this.rule.search_block_xpath = (document.getElementById('rule_editor_search_block_xpath') as HTMLInputElement).value;
		this.rule.search_block_css = (document.getElementById('rule_editor_search_block_css') as HTMLInputElement).value;
		this.rule.search_block_by_css = (document.getElementById('rule_editor_radio_search_css') as HTMLInputElement).checked;
		this.rule.hide_block_xpath = (document.getElementById('rule_editor_hide_block_xpath') as HTMLInputElement).value;
		this.rule.hide_block_css = (document.getElementById('rule_editor_hide_block_css') as HTMLInputElement).value;
		this.rule.hide_block_by_css = (document.getElementById('rule_editor_radio_hide_css') as HTMLInputElement).checked;
		this.rule.block_anyway = (document.getElementById('rule_editor_block_anyway') as HTMLInputElement).checked;
		this.rule.specify_url_by_regexp = (document.getElementById('specify_url_by_regexp_checkbox') as HTMLInputElement).checked;
		let self = this;
		cbStorage.saveRule(this.rule, () => {
			hideEmptyAlert();
			self.showMessage(chrome.i18n.getMessage('saveDone'));
			reloadBackground();
		});
	}

}

window.onload = onStart;
