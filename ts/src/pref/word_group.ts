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
		cbStorage.loadWordGroupsDummy (function (groups:[WordGroup]):void {
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
	constructor () {
		this.uiTitle = document.getElementById("rule_editor_title") as HTMLInputElement;
		this.wordEditor = new WordEditor();
	}
	setGroup (group: WordGroup) {
		console.log(group);
		this.uiTitle.value = group.name;
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
		}
		return this.li;
	}
}

window.onload = initWordGroup;