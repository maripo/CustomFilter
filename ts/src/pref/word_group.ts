function initWordGroup () {
	CustomBlockerUtil.localize;
	console.log("initWordGroup");
	let groups = [] as [WordGroup];
	for (let i=0; i<8; i++) {
		groups.push(cbStorage.createWordGroup());
	}
	console.log(groups);
}
window.onload = initWordGroup;