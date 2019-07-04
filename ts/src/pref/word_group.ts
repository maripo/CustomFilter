function initWordGroup ():void {
	CustomBlockerUtil.localize;
	let page = new WordGroupPage();
	page.init();
	page.load();
}

class WordGroupPage {
	groups: [WordGroup];
	wrappers: [WordGroupWrapper];
	listContainer: HTMLElement;
	editor: WordGroupEditor;
	constructor () {
	}
	init ():void {
		this.listContainer = document.getElementById("ruleList");
		this.editor = new WordGroupEditor();
	}
	load () {
		let scope = this;
		this.wrappers = [] as [WordGroupWrapper];
		console.log(this.wrappers);

		cbStorage.loadAll(function(rules:[Rule], groups:[WordGroup]){
			scope.groups = groups;
			for (let group of groups) {
				console.log(group.name);
				let wrapper = new WordGroupWrapper(group);
				scope.wrappers.push(wrapper);
				let li = wrapper.getInterface();
				li.addEventListener('click', function(){scope.selectWordGroup(wrapper.group)});
				scope.listContainer.appendChild(li);
			}
		});
	}

	selectWordGroup (group: WordGroup) {
		this.editor.setGroup(group);
	}
}

class WordGroupEditor {
	uiTitle: HTMLInputElement;
	wordEditor: WordEditor;
	group:WordGroup;
	constructor () {
		this.uiTitle = document.getElementById("rule_editor_title") as HTMLInputElement;
		this.wordEditor = new WordEditor();
		// Add WordEditor handlers
		let self = this;
		this.wordEditor.addWordHandler = function (word:Word) {
			cbStorage.addWordToWordGroup(self.group, word);
		};
		this.wordEditor.deleteWordHandler = function (word:Word) {
			console.log("TODO addWordHandler");
			cbStorage.removeWordFromWordGroup(self.group, word);
		};
		document.getElementById("rule_editor_save_button").addEventListener("click", function () {
			if (self.group) {
				self.group.name = self.uiTitle.value;
				cbStorage.saveWordGroup(self.group, function () {
					console.log("Group was saved. name=" + self.group.name);
					// TODO reload left list
				});
			}
		});
		document.getElementById("word_group_create_button").addEventListener("click", function(){
			console.log("create new rule");
			let group = cbStorage.createWordGroup();
			group.name = "New Group";
			self.setGroup(group);
		});
	}
	setGroup (group: WordGroup) {
		console.log(group);
		this.uiTitle.value = group.name;
		this.group = group;
		this.wordEditor.setWords(group.words);
	}
}

class WordGroupWrapper {
	group:WordGroup;
	private li: HTMLElement;
	constructor (group:WordGroup) {
		this.group = group;
	}
	getInterface () : HTMLElement {
		if (!this.li) {
			this.li = document.createElement("li");
			this.li.innerHTML = this.group.name;
			// TODO add words

			let keywordsDiv = document.createElement('DIV');
			keywordsDiv.className = 'keywords';

			let keywords = new Array();
			console.log("words.length=" + String(this.group.words.length));
			for (let i=0, l=this.group.words.length; i<l; i++) {
				let keywordSpan = document.createElement('SPAN');
				keywordSpan.className = (this.group.words[i].is_regexp)?"keyword regex":"keyword normal";
				keywordSpan.innerHTML = this.group.words[i].word
				keywordsDiv.appendChild(keywordSpan);
			}
			this.li.appendChild(keywordsDiv);
		}
		return this.li;
	}
}

window.onload = initWordGroup;
