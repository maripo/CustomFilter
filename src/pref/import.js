/**
 * Import JSON
 */
var Import = 
{
	showDialog: function()
	{
		var fileSelector = document.getElementById('fileSelector');
		fileSelector.addEventListener('change', Import.readFile);
	},
	readFile: function (event)
	{
		console.log('Import.readFile');
		var file = event.target.files[0];
		console.log('file.name=' + file.name);
		console.log('file.type=' + file.type);
		var reader = new FileReader ();
		reader.readAsText(file, 'utf8');
		reader.onload =  Import.readContent;
	},
	readContent: function (event)
	{
		console.log('Import.readContent');
		console.log(event.target.result);
	}

};