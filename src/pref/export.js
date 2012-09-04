/**
 * Export JSON
 */
var peer = RulePeer.getInstance();
var wordPeer = WordPeer.getInstance();
var Export = 
{
	onStart: function ()
	{
		Export.ruleWrapperList = new Array();
		Export.loadLists();
		document.getElementById('help_link').href = 'help_' + chrome.i18n.getMessage('extLocale') + '.html';

		document.getElementById('checkboxToggleAll').addEventListener('change', Export.toggleAllCheckboxes,null);
				document.getElementById('buttonExportSelected').addEventListener('click', Export.exportSelected,null);
		
				
		CustomBlockerUtil.localize();
	},
	exportSelected: function()
	{
		var ruleList = new Array();
		for (var i=0, l=Export.ruleWrapperList.length; i<l; i++)
		{
			var ruleWrapper = Export.ruleWrapperList[i];
			if (ruleWrapper.checkbox.checked)
			{
				ruleList.push(ruleWrapper.rule);
			}
		}
		console.log(JSON.stringify(ruleList));
		var url = "data:application/octet-stream," + encodeURIComponent(JSON.stringify(ruleList));
		window.open(url);
	},
	toggleAllCheckboxes: function () {
		RuleWrapper.toggleAllCheckboxes (document.getElementById('checkboxToggleAll'), Export.ruleWrapperList);
	},
	loadLists: function  () 
	{
		peer.select('', Export.onRuleListLoaded, null);
	},
	onRuleListLoaded: function  (list) 
	{
		Export.ruleList = list;
		wordPeer.select('', Export.onWordListLoaded, null);
	},
	onWordListLoaded: function  (wordList) 
	{
		var ruleMap = new Array();
		for (var i=0, l=Export.ruleList.length; i<l; i++) 
		{
			var rule = Export.ruleList[i];
			ruleMap[rule.rule_id] = rule;
		}
		for (var i = 0, l = wordList.length; i < l; i++) 
		{
			var rule = ruleMap[wordList[i].rule_id];
			if (rule) 
			{
				rule.words.push(wordList[i]);
			}
		}
		for (var i=0, l=Export.ruleList.length; i<l; i++) 
		{
			var rule = Export.ruleList[i];
			var wrapper = new RuleWrapper(rule);
			Export.ruleWrapperList.push(wrapper);
			wrapper.liElement.className = (i%2==0)?'odd':'even';
			document.getElementById('ruleList').appendChild(wrapper.liElement);
		}
	}
};
RuleWrapper.getSubDivClassName = function () {
	return "sub_export";
};
window.onload = Export.onStart;