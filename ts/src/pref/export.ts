class Export {
    static ruleWrapperList: PrefRuleWrapper[]
    static ruleList: Rule[]
    static onStart (): void {
        Export.ruleWrapperList = new Array();
        Export.loadLists();
        document.getElementById('help_link').setAttribute("href", 'help_' + chrome.i18n.getMessage('extLocale') + '.html');
        document.getElementById('donate_link').setAttribute("href", 'help_' + chrome.i18n.getMessage('extLocale') + '.html#donate');
        document.getElementById('checkboxToggleAll').addEventListener('change', Export.toggleAllCheckboxes, null);
        document.getElementById('buttonExportSelected').addEventListener('click', Export.exportSelected, null);
        CustomBlockerUtil.localize();
    }
    static exportSelected (): void {
        var ruleList = new Array();
        for (var i = 0, l = Export.ruleWrapperList.length; i < l; i++) {
            var ruleWrapper = Export.ruleWrapperList[i];
            if (ruleWrapper.checkbox.checked) {
                ruleList.push(ruleWrapper.rule);
            }
        }
        if (ruleList.length < 1) {
            alert(chrome.i18n.getMessage('errorExportNoRule'));
            return;
        }
        console.log(JSON.stringify(ruleList));
        var url = "data:application/octet-stream," + encodeURIComponent(JSON.stringify(ruleList));
        window.open(url);
    }
    static toggleAllCheckboxes (): void {
        PrefRuleWrapper.toggleAllCheckboxes(document.getElementById('checkboxToggleAll'), Export.ruleWrapperList);
    }
    static loadLists (): void {
			CustomBlockerStorage.getInstance().loadAll(function(rules:[Rule]){
				Export.ruleList = rules;
        for (var i = 0; i < Export.ruleList.length; i++) {
            var rule = Export.ruleList[i];
            var wrapper = new PrefRuleWrapper(rule);
            Export.ruleWrapperList.push(wrapper);
            document.getElementById('ruleList').appendChild(wrapper.liElement);
        }
			
			});
    }
}
PrefRuleWrapper.getSubDivClassName = function () {
    return "sub_export";
};
window.onload = Export.onStart;
//# sourceMappingURL=export.js.map