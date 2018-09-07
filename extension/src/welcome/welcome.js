var Welcome = (function () {
    function Welcome() {
    }
    Welcome.init = function () {
        Welcome.siteWrappers = [];
        Welcome.renderPreset();
        document.getElementById("buttonUse").addEventListener('click', Welcome.useChecked, false);
        document.getElementById("checkAll").checked = true;
        document.getElementById("checkAll").addEventListener('change', Welcome.toggleAll, false);
        cbStorage.loadAll(function (rules, groups) {
            for (var ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
                Welcome.disableDuplicateRules(rules[ruleIndex]);
            }
        });
    };
    Welcome.disableDuplicateRules = function (existingRule) {
        for (var siteIndex = 0; siteIndex < Welcome.siteWrappers.length; siteIndex++) {
            var site = Welcome.siteWrappers[siteIndex];
            var isNew = false;
            for (var ruleIndex = 0; ruleIndex < site.ruleWrappers.length; ruleIndex++) {
                var presetRule = site.ruleWrappers[ruleIndex];
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
                }
                else {
                    isNew = true;
                }
            }
            if (!isNew && !site.duplicate) {
                site.disable();
            }
        }
    };
    Welcome.renderPreset = function () {
        var listElement = document.getElementById("sites");
        for (var i = 0; i < PRESET_RULES.length; i++) {
            var wrapper = new SiteWrapper(PRESET_RULES[i]);
            Welcome.siteWrappers.push(wrapper);
            listElement.appendChild(wrapper.getElement());
        }
    };
    Welcome.toggleAll = function (sender) {
        for (var i = 0; i < Welcome.siteWrappers.length; i++) {
            var siteWrapper = Welcome.siteWrappers[i];
            siteWrapper.setChecked(sender.srcElement.checked);
        }
    };
    Welcome.useChecked = function () {
        var rulesToUse = [];
        for (var i = 0; i < Welcome.siteWrappers.length; i++) {
            var siteWrapper = Welcome.siteWrappers[i];
            for (var j = 0; j < siteWrapper.ruleWrappers.length; j++) {
                var rule = siteWrapper.ruleWrappers[j];
                if (rule.isChecked() && !rule.isAlreadyImported) {
                    rulesToUse.push(rule);
                    siteWrapper.ruleWrappers[j].li.className = siteWrapper.ruleWrappers[j].li.className + " done";
                    siteWrapper.ruleWrappers[j].checkbox.disabled = true;
                    rule.isAlreadyImported = true;
                }
            }
        }
        for (var i = 0; i < rulesToUse.length; i++) {
            cbStorage.saveRule(rulesToUse[i].rule, null);
        }
        try {
            var bgWindow = chrome.extension.getBackgroundPage();
            bgWindow.reloadLists();
        }
        catch (ex) {
            alert(ex);
        }
        Analytics.trackEvent('contextMenu', 'count' + rulesToUse.length);
    };
    Welcome.getAlreadyInstalledLabel = function () {
        var span = document.createElement('SPAN');
        span.appendChild(document.createTextNode(chrome.i18n.getMessage('alreadyInstalled')));
        span.className = "installed";
        return span;
    };
    return Welcome;
}());
var SiteWrapper = (function () {
    function SiteWrapper(site) {
        this.setChecked = function (checked) {
            if (!this.duplicate) {
                this.checkbox.checked = checked;
                this.toggleAllRules(checked);
            }
        };
        this.site = site;
        this.ruleWrappers = [];
        this.open = false;
        for (var i = 0; i < site.rules.length; i++) {
            this.ruleWrappers.push(new RuleWrapper(site, site.rules[i]));
        }
    }
    SiteWrapper.prototype.getElement = function () {
        if (this.li)
            return this.li;
        var li = document.createElement("LI");
        var openButton = document.createElement("INPUT");
        openButton.type = "button";
        openButton.className = "openButton plus";
        this.openButton = openButton;
        li.appendChild(openButton);
        openButton.addEventListener("click", this.getOpenAction(), true);
        var checkbox = document.createElement("INPUT");
        checkbox.type = "checkbox";
        checkbox.checked = true;
        checkbox.addEventListener("change", this.getOnClickAction(), true);
        this.checkbox = checkbox;
        li.appendChild(checkbox);
        var favicon = document.createElement('IMG');
        favicon.setAttribute("src", (this.site.url) ?
            'chrome://favicon/' + this.site.url : chrome.extension.getURL('img/world.png'));
        li.appendChild(favicon);
        var titleLabel = document.createElement('SPAN');
        titleLabel.appendChild(document.createTextNode(this.site.name));
        li.appendChild(titleLabel);
        this.titleLabel = titleLabel;
        var ul = document.createElement("UL");
        this.ul = ul;
        for (var i = 0; i < this.ruleWrappers.length; i++) {
            ul.appendChild(this.ruleWrappers[i].getElement());
        }
        li.appendChild(ul);
        ul.style.height = "0px";
        this.li = li;
        return li;
    };
    SiteWrapper.prototype.disable = function () {
        this.li.className = 'duplicate';
        this.checkbox.disabled = true;
        this.checkbox.checked = false;
        this.duplicate = true;
        this.titleLabel.appendChild(Welcome.getAlreadyInstalledLabel());
    };
    SiteWrapper.prototype.getOpenAction = function () {
        var self = this;
        return function () {
            self.open = !self.open;
            self.openButton.className = "openButton " + ((self.open) ? "minus" : "plus");
            self.ul.style.height = (self.open) ? ((18 * self.ruleWrappers.length) + "px") : "0px";
            console.log("open");
        };
    };
    SiteWrapper.prototype.getOnClickAction = function () {
        var self = this;
        return function () {
            self.toggleAllRules(self.checkbox.checked);
        };
    };
    SiteWrapper.prototype.toggleAllRules = function (checked) {
        for (var i = 0; i < this.ruleWrappers.length; i++) {
            this.ruleWrappers[i].setChecked(checked);
        }
    };
    return SiteWrapper;
}());
var RuleWrapper = (function () {
    function RuleWrapper(site, rule) {
        this.label = rule.title;
        rule.search_block_by_css = !!rule.search_block_by_css;
        rule.hide_block_by_css = !!rule.hide_block_by_css;
        rule.title = site.name + " | " + rule.title;
        rule.is_disabled = false;
        rule.site_regexp = rule.site_regexp || "";
        rule.example_url = rule.example_url || "";
        rule.specify_url_by_regexp = !!rule.specify_url_by_regexp;
        rule.search_block_xpath = rule.search_block_xpath || "";
        rule.search_block_css = rule.search_block_css || "";
        rule.hide_block_xpath = rule.hide_block_xpath || "";
        rule.hide_block_css = rule.hide_block_css || "";
        rule.user_identifier = null;
        rule.global_identifier = null;
        rule.insert_date = 0;
        rule.update_date = 0;
        rule.delete_date = 0;
        this.rule = rule;
    }
    RuleWrapper.prototype.getElement = function () {
        if (this.li)
            return this.li;
        var li = document.createElement("LI");
        var checkbox = document.createElement("INPUT");
        checkbox.checked = true;
        checkbox.type = "checkbox";
        this.checkbox = checkbox;
        li.appendChild(checkbox);
        li.appendChild(document.createTextNode(this.label));
        this.li = li;
        return li;
    };
    RuleWrapper.prototype.disable = function () {
        this.checkbox.checked = false;
        this.checkbox.disabled = true;
        this.li.className = 'duplicate';
        this.li.appendChild(Welcome.getAlreadyInstalledLabel());
        this.duplicate = true;
    };
    RuleWrapper.prototype.setChecked = function (checked) {
        if (!this.duplicate)
            this.checkbox.checked = checked;
    };
    RuleWrapper.prototype.isChecked = function () {
        return this.checkbox.checked;
    };
    return RuleWrapper;
}());
window.onload = Welcome.init;
//# sourceMappingURL=welcome.js.map