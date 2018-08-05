/* Legacy functions (for legacy SQLite data storage) */

function createRuleTable (): void {
	console.log("createRuleTable");
	LegacyRulePeer.getInstance().createTable(function(){
		LegacyWordPeer.getInstance().createTable(loadLists);
	});
}

function loadLists (): void {
	cbStorage.loadAll (
		function (rules:[Rule]) {
			ruleList = rules;
			loadSmartRuleEditorSrc();
			// saveUuidIfNotSet();
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
			json["sql"] = true;
			obj[storage.getRuleJSONKey(rule)] = json;
			chrome.storage.sync.set(obj, function(){
				scope.syncAll(rulesToSync, callback);
			});
		}

}
function migrateToChromeSync (onMingrationDone) {
	(LegacyRulePeer.getInstance() as LegacyRulePeer).loadAll (
		function (rules:[LegacyRule]) {
			let rulesToSync = [] as [Rule];
			for (let rule of rules) {
				if (!rule.global_identifier || rule.global_identifier=="") {
					rule.global_identifier = UUID.generate();
					console.log("Rule has no UUID. Generated. " + rule.global_identifier);
				}
				rulesToSync.push(rule.getRule());
			}
			syncAll (rulesToSync, onMingrationDone);
		}
	);
}

chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason=="update" && details.previousVersion && 
		( details.previousVersion.match(/^2\./)|| details.previousVersion.match(/^1\./)) ) {
		console.log("DATA MIGRATION NEEDED");
		
		chrome.storage.local.get(["migrationDone"], function(result) {
			console.log("migrationDone=" + result["migrationDone"]);
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