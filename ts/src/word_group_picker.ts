
class WordGroupPicker {
	select:HTMLSelectElement;
	groups:[WordGroup];
	onSelectGroup: (group:WordGroup) => void;
	constructor(select:HTMLSelectElement) {
		this.select = select;
		let scope = this;
		this.select.addEventListener("change", ()=>{
			let index = this.select.selectedIndex;
			if (index > 0) {
				let group = scope.groups[index-1];
				scope.onSelectGroup(group);
			}
		});
	}

	setGroups(groups:[WordGroup]) {
		this.groups = groups;
		for (let group of groups) {
			let option = document.createElement("option");
			option.innerHTML = group.name;
			this.select.appendChild(option);
		}
	}
}
