var Welcome = {
	init: function () {
		Welcome.rulePeer = RulePeer.getInstance();
		Welcome.siteWrappers = [];
		console.log("Welcome.init");
		Welcome.renderPreset();
		console.log("TODO Init Buttons");
		document.getElementById("buttonUse").addEventListener('click',Welcome.useChecked);
	},
	renderPreset: function () {
		console.log("Welcome.renderPreset");
		console.log(PRESET_RULES.length);
		var listElement = document.getElementById("sites");
		for (var i=0; i<PRESET_RULES.length; i++) {
			var wrapper = new Welcome.SiteWrapper(PRESET_RULES[i]);
			Welcome.siteWrappers.push(wrapper);
			listElement.appendChild(wrapper.getElement());
		}
	},
	useChecked: function () {
		console.log("Welcome.renderPreset");
		var rulesToUse = [];
		for (var i=0; i<Welcome.siteWrappers.length; i++) {
			var siteWrapper = Welcome.siteWrappers[i];
			console.log(siteWrapper.site.name);
			for (var j=0; j<siteWrapper.ruleWrappers.length; j++) {
				var rule = siteWrapper.ruleWrappers[j];
				if (rule.isChecked())
					rulesToUse.push(rule);
			}
		}
		console.log(rulesToUse.length);
		for (var i=0; i<rulesToUse.length; i++) {
			Welcome.rulePeer.saveObject(rulesToUse[i].rule);
		}
	}
};

Welcome.SiteWrapper = function (site) {
	this.site = site;
	this.ruleWrappers = [];
	for (var i=0; i<site.rules.length; i++) {
		this.ruleWrappers.push(new Welcome.RuleWrapper(site, site.rules[i]));
	}
};
Welcome.SiteWrapper.prototype.getElement = function () {
	if (this.li) return this.li;
	var li = document.createElement("LI");
	var checkbox = document.createElement("INPUT");
	checkbox.type = "checkbox";
	li.appendChild(checkbox);
	li.appendChild(document.createTextNode(this.site.name));
	var ul = document.createElement("UL");
	li.appendChild(ul);
	for (var i=0; i<this.ruleWrappers.length; i++) {
		ul.appendChild(this.ruleWrappers[i].getElement())
	}
	this.li = li;
	return li;
};

Welcome.RuleWrapper = function (site,rule) {
	this.label = rule.title;
	rule.search_block_by_css = !!rule.search_block_by_css;
	rule.hide_block_by_css = !!rule.hide_block_by_css;
	rule.title =  site.name + " | " + rule.title;
	rule.is_disabled = false;
	rule.site_regexp = rule.site_regexp||"";
	rule.example_url = rule.example_url||"";
	rule.site_description = rule.site_description||"";
	rule.specify_url_by_regexp = !!rule.specify_url_by_regexp;
	rule.search_block_xpath = rule.search_block_xpath||"";
	rule.search_block_css = rule.search_block_css||"";
	rule.search_block_description = rule.search_block_description||"";
	rule.hide_block_xpath = rule.hide_block_xpath||"";
	rule.hide_block_css = rule.hide_block_css||"";
	rule.hide_block_description = "";
	rule.user_identifier = null;
	rule.global_identifier = null;
	rule.insert_date = 0;
	rule.update_date = 0;
	rule.delete_date = 0;
	this.rule = rule;
};

Welcome.RuleWrapper.prototype.getElement = function () {
	if (this.li) return this.li;
	var li = document.createElement("LI");
	var checkbox = document.createElement("INPUT");
	checkbox.type = "checkbox";
	this.checkbox = checkbox;
	li.appendChild(checkbox);
	li.appendChild(document.createTextNode(this.label));
	this.li = li;
	return li;
};
Welcome.RuleWrapper.prototype.isChecked = function () {
	return this.checkbox.checked;
};

window.onload = Welcome.init;