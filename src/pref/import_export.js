RuleWrapper = function (rule)
	{
		this.rule = rule;
		this.liElement = document.createElement('LI');
	this.subLiElement = document.createElement('DIV');
	this.subLiElement.className = 'sub';
	
	this.checkbox = document.createElement('INPUT');
	this.checkbox.type = 'checkbox';
	this.checkbox.className = 'check';
	this.liElement.appendChild(this.checkbox);
	
	var informationDiv = document.createElement('DIV');
	informationDiv.className = 'information';
	
	this.subLiElement.appendChild(informationDiv);
	
	var titleDiv = document.createElement('DIV');
	titleDiv.className = 'title';
	
	titleDiv.innerHTML = CustomBlockerUtil.escapeHTML(CustomBlockerUtil.shorten(this.rule.title, 30));
	
	
	var urlDiv = document.createElement('DIV');
	urlDiv.className = 'url';
	urlDiv.innerHTML = CustomBlockerUtil.escapeHTML(CustomBlockerUtil.shorten(this.rule.site_regexp,30));
	
	var keywordsDiv = document.createElement('DIV');
	keywordsDiv.className = 'keywords';
	
	var keywords = new Array();
	for (var i=0, l=this.rule.words.length; i<l; i++) 
	{
		var keywordSpan = document.createElement('SPAN');
		keywordSpan.className = (this.rule.words[i].is_regexp)?"keyword regex":"keyword normal";
		keywordSpan.innerHTML = this.rule.words[i].word
		keywordsDiv.appendChild(keywordSpan);
	}
	
	
	informationDiv.appendChild(titleDiv);
	informationDiv.appendChild(urlDiv);
	informationDiv.appendChild(keywordsDiv);
	

	var exampleLink = document.createElement('A');
	exampleLink.className = 'exampleUrl';
	exampleLink.innerHTML = '[LINK]';
	exampleLink.target = '_blank';
	exampleLink.href = this.rule.example_url;
	
	var favicon = document.createElement('IMG');
	favicon.src = (this.rule.example_url)?
		'chrome://favicon/' + rule.example_url:chrome.extension.getURL('img/world.png');
		favicon.className = 'favicon';
	informationDiv.appendChild(favicon);
	this.liElement.appendChild(this.subLiElement);
	informationDiv.appendChild(exampleLink);
	
}