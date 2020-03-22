function initWordGroup ():void {
	CustomBlockerUtil.processPage();
	document.getElementById('help_link').setAttribute("href", 'help_' + chrome.i18n.getMessage('extLocale') + '.html');
	document.getElementById('donate_link').setAttribute("href", 'help_' + chrome.i18n.getMessage('extLocale') + '.html#donate');
	let page = new WordGroupPage();
	page.init();
	page.load();
}

class WordGroupPage {
	groups: [WordGroup];
	listContainer: HTMLElement;
	editor: WordGroupEditor;
	constructor () {
	}
	init (): void {
		this.listContainer = document.getElementById("js_rule-list");
		this.editor = new WordGroupEditor();
		this.editor.onSave = () => {
			this.listContainer.innerHTML = "";
			this.load();
		};
	}
	load () {
		let scope = this;
		this.listContainer.innerHTML = "";
		cbStorage.loadAll((rules:[Rule], groups:[WordGroup])=>{
			this.groups = groups;
			console.log(groups);
			for (let group of groups) {
				console.log(group.name);
				let li = this.getInterface(group);
				li.addEventListener('click', ()=>{this.selectWordGroup(group)});
				this.listContainer.appendChild(li);
			}
		});
	}
	getInterface (group:WordGroup) : HTMLElement {
		let li = document.createElement("li");
		li.className = "rule-list__item";
		li.innerHTML = group.name;

		let buttonContainer = document.createElement('DIV');
		buttonContainer.className = 'button-container';
		buttonContainer.appendChild(this.createSelectButton(group));
		buttonContainer.appendChild(this.createDeleteButton(group));
		li.appendChild(buttonContainer);

		let keywordsDiv = document.createElement('DIV');
		keywordsDiv.className = 'keywords';

		let keywords = new Array();
		for (let word of group.words) {
			let keywordSpan = document.createElement('SPAN');
			keywordSpan.className = (word.is_regexp)?"keyword keyword--regex":"keyword keyword--normal";
			keywordSpan.innerHTML = word.word;
			keywordsDiv.appendChild(keywordSpan);
			keywordsDiv.appendChild(document.createTextNode(" "));
		}
		li.appendChild(keywordsDiv);
		return li;
	}
	createSelectButton (group:WordGroup): HTMLInputElement {
		let button = document.createElement('INPUT') as HTMLInputElement;
		button.type = 'BUTTON';
		button.className = 'ui-button buttonEdit';
		button.value = chrome.i18n.getMessage('buttonLabelEdit');
		button.addEventListener('click', ()=>{this.selectWordGroup(group);}, true);
		return button;
	}
	createDeleteButton (group:WordGroup): HTMLInputElement {
		let button = document.createElement('INPUT') as HTMLInputElement;
		button.type = 'BUTTON';
		button.className = 'ui-button buttonDelete';
		button.value = chrome.i18n.getMessage('buttonLabelDelete');
		button.addEventListener('click', ()=>{this.deleteWordGroup(group);}, true);
		return button;
	}

	selectWordGroup (group: WordGroup) {
		this.editor.setGroup(group);
	}
	deleteWordGroup (group: WordGroup) {
		let message = chrome.i18n.getMessage('wordGroupDelete').replace("___GROUP___", group.name);
		if (window.confirm(message)) {
			cbStorage.deleteWordGroup(group, () => {
				try {
					let bgWindow = chrome.extension.getBackgroundPage();
					bgWindow.reloadLists();
				} catch (ex) {
					alert(ex)
				}
				this.load();
			});
		}
	}
}

class WordGroupEditor {
	uiTitle: HTMLInputElement;
	wordEditor: WordEditor;
	group:WordGroup;
	onSave:() => void;
	alertDiv: HTMLElement;
	constructor () {
		this.uiTitle = document.getElementById("rule_editor_title") as HTMLInputElement;
		this.wordEditor = new WordEditor();
		this.alertDiv = document.getElementById('rule_editor_alert');
		// Add WordEditor handlers
		let self = this;
		this.wordEditor.addWordHandler = function (word:Word) {
			cbStorage.addWordToWordGroup(self.group, word);
		};
		this.wordEditor.deleteWordHandler = function (word:Word) {
			console.log("TODO addWordHandler");
			cbStorage.removeWordFromWordGroup(self.group, word);
		};
		document.getElementById("rule_editor_save_button").addEventListener("click", () => {
			if (self.group) {
				if (self.uiTitle.value == "") {
					self.showMessage(chrome.i18n.getMessage('errorWordGroupNameEmpty'));
					return;
				}
				self.group.name = self.uiTitle.value;
				cbStorage.saveWordGroup(self.group, () => {
					console.log("Group was saved. name=" + self.group.name);
					try {
						var bgWindow = chrome.extension.getBackgroundPage();
						self.showMessage(chrome.i18n.getMessage('wordGroupSaveDone'));
						bgWindow.reloadLists();
					} catch (ex) {
						alert(ex)
					}
					if (self.onSave) {
						self.onSave();
					}
				});
			}
		});
		document.getElementById("js_word_group_create_button").addEventListener("click", ()=>{
			console.log("create new group");
			let group = cbStorage.createWordGroup();
			group.name = "New Group";
			self.setGroup(group);
		});
	}
	setGroup (group: WordGroup) {
		this.uiTitle.value = group.name;
		this.group = group;
		this.wordEditor.setWords(group.words);
		this.hideMessage();
		this.uiTitle.focus();
	}
	showMessage (str: string): void {
		this.alertDiv.style.display = 'block';
		this.alertDiv.innerHTML = str;
	}

	hideMessage (): void{
		this.alertDiv.style.display = 'none';
	}
}

class WordGroupWrapper {
	group:WordGroup;
	private li: HTMLElement;
	constructor (group:WordGroup) {
		this.group = group;
	}
	getInterface (group:WordGroup) : HTMLElement {
		if (!this.li) {
			this.li = document.createElement("li");
			this.li.innerHTML = this.group.name;

			let buttonContainer = document.createElement('DIV');
			buttonContainer.className = 'button-container';
			buttonContainer.appendChild(this.createSelectButton());
			buttonContainer.appendChild(this.createDeleteButton());
			this.li.appendChild(buttonContainer);

			let keywordsDiv = document.createElement('DIV');
			keywordsDiv.className = 'keywords';

			let keywords = new Array();
			console.log("words.length=" + String(this.group.words.length));
			for (let i=0, l=this.group.words.length; i<l; i++) {
				let keywordSpan = document.createElement('SPAN');
				keywordSpan.className = (this.group.words[i].is_regexp)?"keyword keyword--regex":"keyword keyword--normal";
				keywordSpan.innerHTML = this.group.words[i].word;
				keywordsDiv.appendChild(keywordSpan);
				keywordsDiv.appendChild(document.createTextNode(" "));
			}
			this.li.appendChild(keywordsDiv);
		}
		return this.li;
	}
	createSelectButton (): HTMLInputElement {
		let button = document.createElement('INPUT') as HTMLInputElement;
		button.type = 'BUTTON';
		button.className = 'ui-button buttonEdit';
		button.value = chrome.i18n.getMessage('buttonLabelEdit');
		// button.addEventListener('click', this.getSelectAction(), true);
		return button;
	}
	createDeleteButton (): HTMLInputElement {
		let button = document.createElement('INPUT') as HTMLInputElement;
		button.type = 'BUTTON';
		button.className = 'ui-button buttonDelete';
		button.value = chrome.i18n.getMessage('buttonLabelDelete');
		// button.addEventListener('click', this.getDeleteAction(), true);
		return button;
	}
}

window.onload = initWordGroup;
