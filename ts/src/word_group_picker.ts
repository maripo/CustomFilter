
class WordGroupPicker {
	select:HTMLSelectElement;
	groups:[WordGroup];
	rule:Rule;
	onSelectGroup: (group:WordGroup) => void;
	selectableGroups:[WordGroup];
	constructor(select:HTMLSelectElement) {
		this.select = select;
		let scope = this;
		this.select.addEventListener("change", ()=>{
			let index = this.select.selectedIndex;
			if (index > 0) {
				let group = scope.selectableGroups[index-1];
				scope.onSelectGroup(group);
			}
		});
	}

	refresh () {
		this.select.innerHTML = "";
		let emptyOption = document.createElement("OPTION");
		emptyOption.innerHTML = "----";
		this.select.appendChild(emptyOption);
		if (!this.groups) return;
		this.selectableGroups = [] as [WordGroup];
		for (let group of this.groups) {
			let contains = false;
			if (this.rule) {
				for (let selectedGroup of this.rule.wordGroups) {
					if (selectedGroup.global_identifier==group.global_identifier) {
						contains = true;
						break;
					}
				}
			}
			if (!contains) {
				let option = document.createElement("option");
				option.innerHTML = group.name;
				this.selectableGroups.push(group);
				this.select.appendChild(option);
			}
		}
		this.select.selectedIndex = 0;
	}

	setGroups (groups:[WordGroup]) {
		this.groups = groups;
	}

	setRule (rule:Rule) {
		this.rule = rule;
	}
}
