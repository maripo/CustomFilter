var Import = (function () {
    function Import() {
    }
    Import.onStart = function () {
        var fileSelector = document.getElementById('fileSelector');
        document.getElementById('button_import').addEventListener('click', Import.saveSelected, false);
        fileSelector.addEventListener('change', Import.readFile);
        document.getElementById('checkboxToggleAll').addEventListener('change', Import.toggleAllCheckboxes, false);
        CustomBlockerStorage.getInstance().loadAll(function (rules) {
            Import.ruleList = rules;
        });
        document.getElementById('help_link').setAttribute("href", 'help_' + chrome.i18n.getMessage('extLocale') + '.html');
        document.getElementById('donate_link').setAttribute("href", 'help_' + chrome.i18n.getMessage('extLocale') + '.html#donate');
        document.getElementById('help_link_empty').setAttribute("href", 'help_' + chrome.i18n.getMessage('extLocale') + '.html');
        CustomBlockerUtil.processPage();
    };
    Import.readFile = function (event) {
        console.log('Import.readFile');
        var file = event.target.files[0];
        console.log('file.name=' + file.name);
        console.log('file.type=' + file.type);
        var reader = new FileReader();
        reader.readAsText(file, 'utf8');
        reader.onload = Import.readContent;
    };
    Import.toggleAllCheckboxes = function (sender) {
        PrefRuleWrapper.toggleAllCheckboxes(document.getElementById('checkboxToggleAll'), Import.list);
    };
    Import.relateWithExistingRule = function (rule) {
        rule.existing = false;
        rule.rule_id = 0;
        for (var i = 0; i < Import.ruleList.length; i++) {
            var existingRule = Import.ruleList[i];
            if (existingRule.user_identifier == rule.user_identifier) {
                Import.relateWithExistingWord(rule, existingRule);
                rule = existingRule;
                rule.existing = true;
            }
        }
        if (!rule.existing) {
            for (var i = 0; i < rule.words.length; i++) {
                rule.words[i].word_id = 0;
            }
        }
        return rule;
    };
    Import.relateWithExistingWord = function (rule, existingRule) {
        if (!existingRule.words || !rule.words)
            return null;
        for (var i = 0; i < existingRule.words.length; i++) {
            var found = false;
            var existingWord = existingRule.words[i];
            for (var j = 0; j < rule.words.length; j++) {
                var word = rule.words[j];
                if (word.is_regexp == existingWord.is_regexp && word.word == existingWord.word) {
                    found = true;
                }
            }
            if (!found) {
                existingWord.word_id = 0;
                rule.words.push(existingWord);
            }
        }
    };
    Import.readContent = function (event) {
        var importedList = [];
        console.log(event.target.result);
        try {
            importedList = JSON.parse(event.target.result);
        }
        catch (ex) {
            console.log(ex);
            alert(chrome.i18n.getMessage('importErrorInvalidFormat'));
        }
        Import.list = [];
        for (var i = 0; i < importedList.length; i++) {
            var rule = Import.relateWithExistingRule(importedList[i]);
            var listElement = new PrefRuleWrapper(rule);
            var importIcon = document.createElement('IMG');
            importIcon.setAttribute("src", (rule.existing) ? '../img/import_update.png' : '../img/import_add.png');
            importIcon.className = 'importIcon';
            importIcon.title = (rule.existing) ? 'UPDATE' : 'NEW';
            listElement.liElement.appendChild(importIcon);
            Import.list.push(listElement);
            document.getElementById('ruleList').appendChild(listElement.liElement);
        }
        document.getElementById('imported').style.display = 'block';
    };
    Import.saveSelected = function (event) {
        document.getElementById('button_import').disabled = true;
        Import.savingRuleIndex = 0;
        Import.savingWordIndex = 0;
        Import.saveRule();
    };
    Import.saveRule = function () {
        var rule = null;
        while (rule == null && Import.savingRuleIndex < Import.list.length) {
            var _rule = Import.list[Import.savingRuleIndex];
            if (_rule && _rule.checkbox.checked)
                rule = _rule;
            else
                Import.savingRuleIndex++;
        }
        Import.savingRuleIndex++;
        if (!rule) {
            alert(chrome.i18n.getMessage('importDone'));
            document.getElementById('button_import').disabled = false;
            try {
                var bgWindow = chrome.extension.getBackgroundPage();
                bgWindow.reloadLists();
            }
            catch (ex) {
                alert(ex);
            }
            return;
        }
        RulePeer.getInstance().saveObject(rule.rule, function (insertedRule) {
            Import.savingWordIndex = 0;
            Import.currentRule = insertedRule;
            Import.saveWord();
        }, function () {
            alert("Error.");
        });
    };
    Import.saveWord = function () {
        var word;
        var rule = Import.currentRule;
        while (word == null && Import.savingWordIndex < rule.words.length) {
            var _word = rule.words[Import.savingWordIndex];
            if (_word)
                word = _word;
            else
                Import.savingWordIndex++;
        }
        Import.savingWordIndex++;
        if (!word) {
            Import.saveRule();
            return;
        }
        word.rule_id = rule.rule_id;
        WordPeer.getInstance().saveObject(word, function (insertedWord) {
            Import.saveWord();
        }, function () {
            alert("Error.");
        });
    };
    return Import;
}());
PrefRuleWrapper.getSubDivClassName = function () {
    return "sub_import";
};
window.onload = Import.onStart;
//# sourceMappingURL=import.js.map