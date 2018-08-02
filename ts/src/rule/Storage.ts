/* Storage management */
class CustomBlockerStorage {
	static instance:CustomBlockerStorage;
	public static getInstance () : CustomBlockerStorage {
		if (!CustomBlockerStorage.instance) {
      CustomBlockerStorage.instance = new CustomBlockerStorage();
		}
		return CustomBlockerStorage.instance;
	}
	
	public loadAll (callback:([Rule])=>void): void {
		console.log("loadAll TODO");
		chrome.storage.sync.get(null, function (allObj) {
			console.log(allObj);
			let rules = [] as [Rule];
			for (let key in allObj) {
				if (key.indexOf("R-")==0) {
					console.log("Key found. " + key);
					rules.push(new Rule().initByJSON(allObj[key]));
				} else {
					console.log("Invalid key: " + key);
				}
			}
			callback(rules);
		});
	}
}