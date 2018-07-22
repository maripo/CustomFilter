var PrefRuleWrapper = (function () {
    function PrefRuleWrapper(rule) {
        this.rule = rule;
        this.liElement = document.createElement('LI');
        this.subLiElement = document.createElement('DIV');
        this.subLiElement.className = PrefRuleWrapper.getSubDivClassName();
        this.checkbox = document.createElement('INPUT');
        this.checkbox.type = 'checkbox';
        this.checkbox.className = 'check';
        this.liElement.addEventListener('click', function (event) {
            if (checkbox == event.srcElement)
                return;
            checkbox.checked = !checkbox.checked;
        }, true);
        var checkbox = this.checkbox;
        this.liElement.appendChild(this.checkbox);
        var informationDiv = document.createElement('DIV');
        informationDiv.className = 'information';
        this.subLiElement.appendChild(informationDiv);
        var titleDiv = document.createElement('DIV');
        titleDiv.className = 'title';
        var title = this.rule.title;
        titleDiv.innerHTML = CustomBlockerUtil.shorten(title, 42);
        var urlDiv = document.createElement('DIV');
        urlDiv.className = 'url';
        urlDiv.innerHTML = CustomBlockerUtil.shorten(this.rule.site_regexp, 36);
        var keywordsDiv = document.createElement('DIV');
        keywordsDiv.className = 'keywords';
        var keywords = new Array();
        for (var i = 0, l = this.rule.words.length; i < l; i++) {
            var keywordSpan = document.createElement('SPAN');
            keywordSpan.className = (this.rule.words[i].is_regexp) ? "keyword regex" : "keyword normal";
            keywordSpan.innerHTML = this.rule.words[i].word;
            keywordsDiv.appendChild(keywordSpan);
        }
        informationDiv.appendChild(titleDiv);
        informationDiv.appendChild(urlDiv);
        informationDiv.appendChild(keywordsDiv);
        var exampleLink = document.createElement('A');
        exampleLink.className = 'exampleUrl';
        exampleLink.innerHTML = '[LINK]';
        exampleLink.setAttribute("target", '_blank');
        exampleLink.setAttribute("href", this.rule.example_url);
        var favicon = document.createElement('IMG');
        var faviconSrc = (this.rule.example_url) ?
            'chrome://favicon/' + rule.example_url : chrome.extension.getURL('img/world.png');
        favicon.className = 'favicon';
        favicon.setAttribute("src", faviconSrc);
        informationDiv.appendChild(favicon);
        this.liElement.appendChild(this.subLiElement);
        informationDiv.appendChild(exampleLink);
    }
    PrefRuleWrapper.toggleAllCheckboxes = function (sender, wrapperList) {
        var checked = sender.checked;
        for (var i = 0, l = wrapperList.length; i < l; i++) {
            wrapperList[i].checkbox.checked = checked;
        }
    };
    PrefRuleWrapper.setSubDivClassName = function (name) {
        PrefRuleWrapper.subDivClassName = name;
    };
    PrefRuleWrapper.getSubDivClassName = function () {
        return PrefRuleWrapper.subDivClassName;
    };
    return PrefRuleWrapper;
}());
//# sourceMappingURL=import_export.js.map