class Welcome {
	static siteWrappers:SiteWrapper[];
	static init () {
		Welcome.siteWrappers = [];
		Welcome.renderPreset();
		document.getElementById("buttonUse").addEventListener('click',Welcome.useChecked, false);
		(document.getElementById("checkAll") as HTMLInputElement).checked = true;
		document.getElementById("checkAll").addEventListener('change', Welcome.toggleAll, false);

		cbStorage.loadAll (
			function (rules:[Rule], groups:[WordGroup]) {
				for (let ruleIndex = 0; ruleIndex<rules.length; ruleIndex++) {
					Welcome.disableDuplicateRules(rules[ruleIndex]);
				}
			});
	}

	static disableDuplicateRules (existingRule:Rule): void {
		for (let siteIndex = 0; siteIndex < Welcome.siteWrappers.length; siteIndex++) {
			let site = Welcome.siteWrappers[siteIndex];
			let isNew = false;
			for (let ruleIndex = 0; ruleIndex < site.ruleWrappers.length; ruleIndex++) {
				let presetRule = site.ruleWrappers[ruleIndex];
				//Compare
				if (presetRule.rule.site_regexp == existingRule.site_regexp
						&&
					presetRule.rule.search_block_css == existingRule.search_block_css
						&&
					presetRule.rule.hide_block_css == existingRule.hide_block_css
						&&
					presetRule.rule.specify_url_by_regexp == existingRule.specify_url_by_regexp
						&&
					!presetRule.duplicate) {
						presetRule.disable();
				}
				if (presetRule.duplicate) {
					console.log("disable");
				} else {
					// new
					isNew = true;
				}
			}
			if (!isNew && !site.duplicate) {
				site.disable();
			}
		}

	}
	static renderPreset (): void {
		let listElement = document.getElementById("sites");
		for (let i=0; i<PRESET_RULES.length; i++) {
			let wrapper = new SiteWrapper(PRESET_RULES[i]);
			Welcome.siteWrappers.push(wrapper);
			listElement.appendChild(wrapper.getElement());
		}
	}
	static toggleAll (sender): void {
		for (let i=0; i<Welcome.siteWrappers.length; i++) {
			let siteWrapper = Welcome.siteWrappers[i];
			siteWrapper.setChecked(sender.srcElement.checked);
		}
	}
	static useChecked (): void {
		let rulesToUse = [] as [RuleWrapper];
		for (let i=0; i<Welcome.siteWrappers.length; i++) {
			let siteWrapper = Welcome.siteWrappers[i];
			for (let j=0; j<siteWrapper.ruleWrappers.length; j++) {
				let rule = siteWrapper.ruleWrappers[j];
				if (rule.isChecked() && !rule.isAlreadyImported) {
					rulesToUse.push(rule);
					siteWrapper.ruleWrappers[j].li.className = siteWrapper.ruleWrappers[j].li.className + " done";
					siteWrapper.ruleWrappers[j].checkbox.disabled = true;
					rule.isAlreadyImported = true;
				}
			}
		}
		for (let i=0; i<rulesToUse.length; i++) {
			cbStorage.saveRule(rulesToUse[i].rule, null);
		}
		// Reload imported rules
		try {
			let bgWindow = chrome.extension.getBackgroundPage();
			bgWindow.reloadLists();
		}
		catch (ex) {
			alert(ex)
		}
	}
	static getAlreadyInstalledLabel (): HTMLElement {
		let span = document.createElement('SPAN');
		span.appendChild(document.createTextNode(chrome.i18n.getMessage('alreadyInstalled')));
		span.className = "installed";
		return span;
	}
}

class SiteWrapper {
	site:any;
	ruleWrappers:any[];
	open:boolean;
	openButton: HTMLInputElement;
	checkbox: HTMLInputElement;
	titleLabel: HTMLElement;
	ul: HTMLElement;
	li: HTMLElement;
	duplicate: boolean;
	constructor (site) {
		this.site = site;
		this.ruleWrappers = [];
		this.open = false;
		for (let i=0; i<site.rules.length; i++) {
			this.ruleWrappers.push(new RuleWrapper(site, site.rules[i]));
		}
	}
	getElement ():HTMLElement {
		if (this.li) return this.li;
		let li = document.createElement("LI");
		let openButton = document.createElement("INPUT") as HTMLInputElement;
		openButton.type = "button";
		openButton.className = "openButton plus";
		this.openButton = openButton;
		li.appendChild(openButton);
		openButton.addEventListener("click", this.getOpenAction(), true)
		let checkbox = document.createElement("INPUT") as HTMLInputElement;
		checkbox.type = "checkbox";
		checkbox.checked = true;
		checkbox.addEventListener("change", this.getOnClickAction(), true);
		this.checkbox = checkbox;
		li.appendChild(checkbox);
		let favicon = document.createElement('IMG');
		favicon.setAttribute("src", (this.site.url)?
			'chrome://favicon/' + this.site.url:chrome.extension.getURL('img/world.png'));
		li.appendChild(favicon);
		let titleLabel = document.createElement('SPAN');
		titleLabel.appendChild(document.createTextNode(this.site.name));
		li.appendChild(titleLabel);
		this.titleLabel = titleLabel;
		let ul = document.createElement("UL");
		this.ul = ul;
		for (let i=0; i<this.ruleWrappers.length; i++) {
			ul.appendChild(this.ruleWrappers[i].getElement())
		}
		li.appendChild(ul);
		ul.style.height = "0px";
		this.li = li;
		return li;
	}
	disable () {
		this.li.className = 'duplicate';
		this.checkbox.disabled = true;
		this.checkbox.checked = false;
		this.duplicate = true;
		this.titleLabel.appendChild(Welcome.getAlreadyInstalledLabel());
	}
	getOpenAction () {
		let self = this;
		return function () {
			self.open = !self.open;
			self.openButton.className = "openButton " + ((self.open)?"minus":"plus");
			self.ul.style.height = (self.open)?((18*self.ruleWrappers.length) + "px"):"0px";
			console.log("open");
		};
	}
	getOnClickAction () {
		let self = this;
		return function () {
			self.toggleAllRules(self.checkbox.checked);
		};
	}
	setChecked = function (checked) {
		if (!this.duplicate) {
			this.checkbox.checked = checked;
			this.toggleAllRules(checked);
		}
	}
	toggleAllRules (checked) {
		for (let i=0; i<this.ruleWrappers.length; i++) {
			this.ruleWrappers[i].setChecked(checked);
		}
	}
}
class RuleWrapper {
	label:string;
	li:HTMLElement;
	checkbox:HTMLInputElement;
	duplicate:boolean;
	rule:Rule;
	constructor (site, rule:Rule) {
		this.label = rule.title;
		rule.search_block_by_css = !!rule.search_block_by_css;
		rule.hide_block_by_css = !!rule.hide_block_by_css;
		rule.title =  site.name + " | " + rule.title;
		rule.is_disabled = false;
		rule.site_regexp = rule.site_regexp||"";
		rule.example_url = rule.example_url||"";
		rule.specify_url_by_regexp = !!rule.specify_url_by_regexp;
		rule.search_block_xpath = rule.search_block_xpath||"";
		rule.search_block_css = rule.search_block_css||"";
		rule.hide_block_xpath = rule.hide_block_xpath||"";
		rule.hide_block_css = rule.hide_block_css||"";
		rule.user_identifier = null;
		rule.global_identifier = null;
		rule.insert_date = 0;
		rule.update_date = 0;
		rule.delete_date = 0;
		this.rule = rule;
	}
	getElement () {
		if (this.li) return this.li;
		let li = document.createElement("LI");
		let checkbox = document.createElement("INPUT") as HTMLInputElement;
		checkbox.checked = true;
		checkbox.type = "checkbox";
		this.checkbox = checkbox;
		li.appendChild(checkbox);
		li.appendChild(document.createTextNode(this.label));
		this.li = li;
		return li;
	}
	disable () {
		this.checkbox.checked = false;
		this.checkbox.disabled = true;
		this.li.className = 'duplicate';
		this.li.appendChild(Welcome.getAlreadyInstalledLabel());
		this.duplicate = true;
	}
	setChecked (checked) {
		if (!this.duplicate)
			this.checkbox.checked = checked;
	}
	isChecked () {
		return this.checkbox.checked;
	}
}

window.onload = Welcome.init;
