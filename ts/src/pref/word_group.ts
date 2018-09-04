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
	constructor () {
	}
	init ():void {
		this.listContainer = document.getElementById("ruleList");
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
				scope.listContainer.appendChild(wrapper.getInterface());
			}
		});
	
	}
}

class WordGroupEditor {

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