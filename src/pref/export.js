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
			console.log("rule=" + rule);
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
			document.getElementById('ruleList').appendChild(wrapper.liElement);
		}
	}
};