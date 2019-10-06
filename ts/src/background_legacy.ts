/* Legacy functions (for legacy SQLite data storage) */

function createRuleTable (): void {
	console.log("createRuleTable");
	LegacyRulePeer.getInstance().createTable(function(){
		LegacyWordPeer.getInstance().createTable(loadLists);
	});
}

function loadLists (): void {
	cbStorage.loadAll (
		(rules:[Rule], groups:[WordGroup]) => {
			ruleList = rules;
			loadSmartRuleEditorSrc();
		}
	);
}

function syncAll (rulesToSync: [Rule], callback) {
		if (rulesToSync.length==0) {
			console.log("Snyc done.");
			callback();
		} else {
			let scope = this;
			let rule = rulesToSync.pop();
			let obj = {};
			let storage = cbStorage;
			let json = storage.convertRuleToJSON(rule);
			json["merge"] = true;
			obj[storage.getRuleJSONKey(rule)] = json;
			chrome.storage.sync.set(obj, function(){
				scope.syncAll(rulesToSync, callback);
			});
		}

}
function migrateToChromeSync (onMingrationDone) {
	cbStorage.getDeviceId(function(deviceId:string){
		(LegacyRulePeer.getInstance() as LegacyRulePeer).loadAll (
			function (rules:[LegacyRule]) {
				let rulesToSync = [] as [Rule];
				for (let rule of rules) {
					if (!rule.global_identifier || rule.global_identifier=="") {
						rule.global_identifier = UUID.generate();
						console.log("Rule has no UUID. Generated. " + rule.global_identifier);
					}
					let ruleObj = rule.getRule();
					ruleObj.updaterId = deviceId;
					rulesToSync.push(ruleObj);
				}
				syncAll (rulesToSync, onMingrationDone);
			}
		);
	});

}

chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason=="install") {
		chrome.storage.local.set({migrationDone:true}, function () {
			console.log("Migration flag set.");
		});
	} else if (details.reason=="update" ) {
		console.log("DATA MIGRATION NEEDED? Checking...");
		chrome.storage.local.get(["migrationDone"], function(result) {
			if (!result["migrationDone"]) {
				console.log("Migration flag is empty. Start migration...");
				migrateToChromeSync (function(){
					console.log("Migration done.");
					chrome.storage.local.set({migrationDone:true}, function () {
						console.log("Migration flag set.");
					});
				});
			}
		});
	}
});
function manualDataMigration() {
	console.log("manualDataMigration");
	migrateToChromeSync (function(){
		console.log("Migration done.");
		chrome.storage.local.set({migrationDone:true}, function () {
			console.log("Migration flag set.");
		});
	});
}
