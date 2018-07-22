class PrefRuleWrapper {
  rule:Rule;
  liElement: HTMLElement;
  subLiElement: HTMLElement;
  checkbox: HTMLInputElement;
  constructor (rule) {
    this.rule = rule;
    this.liElement = document.createElement('LI');
    this.subLiElement = document.createElement('DIV');
    this.subLiElement.className = PrefRuleWrapper.getSubDivClassName();
  
    this.checkbox = document.createElement('INPUT') as HTMLInputElement;
    this.checkbox.type = 'checkbox';
    this.checkbox.className = 'check';
    this.liElement.addEventListener ('click',
      function (event)
      {
          if (checkbox==event.srcElement) return;
          checkbox.checked = !checkbox.checked;
      },
      true);
    let checkbox = this.checkbox;
    
    this.liElement.appendChild(this.checkbox);
    
    let informationDiv = document.createElement('DIV');
    informationDiv.className = 'information';
    
    this.subLiElement.appendChild(informationDiv);
    
    let titleDiv = document.createElement('DIV');
    titleDiv.className = 'title';
    
    let title = this.rule.title;
    titleDiv.innerHTML = CustomBlockerUtil.shorten(title, 42);
    
    
    let urlDiv = document.createElement('DIV');
    urlDiv.className = 'url';
    urlDiv.innerHTML = CustomBlockerUtil.shorten(this.rule.site_regexp,36);
    
    let keywordsDiv = document.createElement('DIV');
    keywordsDiv.className = 'keywords';
    
    let keywords = new Array();
    for (let i=0, l=this.rule.words.length; i<l; i++) 
    {
      let keywordSpan = document.createElement('SPAN');
      keywordSpan.className = (this.rule.words[i].is_regexp)?"keyword regex":"keyword normal";
      keywordSpan.innerHTML = this.rule.words[i].word
      keywordsDiv.appendChild(keywordSpan);
    }
    
    
    informationDiv.appendChild(titleDiv);
    informationDiv.appendChild(urlDiv);
    informationDiv.appendChild(keywordsDiv);
    
  
    let exampleLink = document.createElement('A');
    exampleLink.className = 'exampleUrl';
    exampleLink.innerHTML = '[LINK]';
    exampleLink.setAttribute("target", '_blank');
    exampleLink.setAttribute("href", this.rule.example_url);
    
    let favicon = document.createElement('IMG');
    let faviconSrc = (this.rule.example_url)?
      'chrome://favicon/' + rule.example_url:chrome.extension.getURL('img/world.png');
    favicon.className = 'favicon';
    favicon.setAttribute("src", faviconSrc);
    informationDiv.appendChild(favicon);
    this.liElement.appendChild(this.subLiElement);
    informationDiv.appendChild(exampleLink);
  }
  
  static toggleAllCheckboxes (sender, wrapperList)
  {
    let checked = sender.checked;
    for (let i=0, l=wrapperList.length; i<l; i++)
    {
      wrapperList[i].checkbox.checked = checked;
    }
  }
  static subDivClassName: string;
  static setSubDivClassName (name: string) {
    PrefRuleWrapper.subDivClassName = name;
  }
  static getSubDivClassName () {
    return PrefRuleWrapper.subDivClassName;
  }
  
}
