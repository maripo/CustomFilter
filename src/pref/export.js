/**
 * Export JSON
 */
var Export = 
{
	onStart: function ()
	{
		
	},
	showDialog: function()
	{
		var fileSelector = document.getElementById('fileSelector');
		fileSelector.addEventListener('change', Export.readFile);
		console.log(JSON.stringify(ruleList));
		var url = "data:application/octet-stream," + encodeURIComponent(JSON.stringify(ruleList));
		window.open(url);
	}
};