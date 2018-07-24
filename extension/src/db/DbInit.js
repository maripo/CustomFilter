var db = null;
var needDbUpdate = false;
var LATEST_DB_VERSION = "4.0";
var DB_SIZE = 1024 * 1024 * 5;
try {
    needDbUpdate = false;
    db = window.openDatabase("customblocker", LATEST_DB_VERSION, "customblocker extension", DB_SIZE);
}
catch (ex) {
    console.log("Database Update Required." + ex);
    try {
        console.log("Trying to open DB 3.0");
        db = window.openDatabase("customblocker", "2.0", "customblocker extension", DB_SIZE);
        if (db) {
            needDbUpdate = true;
        }
    }
    catch (ex) {
        console.log("Trying to open DB 3.0 ...Failed" + ex);
        try {
            console.log("Trying to open DB 2.0");
            db = window.openDatabase("customblocker", "2.0", "customblocker extension", DB_SIZE);
            if (db) {
                needDbUpdate = true;
            }
        }
        catch (ex) {
            console.log("Trying to open DB 2.0 ...Failed" + ex);
            try {
                console.log("Trying to open DB 1.0");
                db = window.openDatabase("customblocker", "1.0", "customblocker extension", DB_SIZE);
                if (db) {
                    needDbUpdate = true;
                }
            }
            catch (ex) {
                console.log("Trying to open DB 1.0 ...Failed" + ex);
            }
        }
    }
}
function updateDbIfNeeded(callback) {
    console.log("updateDbIfNeeded needDbUpdate");
    if (!db) {
        db = window.openDatabase("customblocker", "", "customblocker extension", DB_SIZE);
    }
    var currentDbVersion = db.version;
    if (LATEST_DB_VERSION != currentDbVersion) {
        console.log("Database Update " + currentDbVersion + "->" + LATEST_DB_VERSION);
        if ("3.0" == currentDbVersion) {
            console.log("Update from Default (1.0 or no-version)");
            db.changeVersion(currentDbVersion, LATEST_DB_VERSION, function (transaction) {
                console.log("Adding columns...");
                transaction.executeSql("alter table rule add column specify_url_by_regexp;");
                transaction.executeSql("UPDATE rule SET specify_url_by_regexp=1;", [], function () {
                    console.log("Columns added.");
                    callback();
                }, function () {
                    console.log("DB Version-up FAILED. change version 2.0->1.0");
                    db.changeVersion("2.0", "1.0", callback);
                });
            });
            console.log("Update from ver 3.0");
        }
        if ("2.0" == currentDbVersion) {
            console.log("Update from Default (1.0 or no-version)");
            db.changeVersion(currentDbVersion, LATEST_DB_VERSION, function (transaction) {
                console.log("Adding columns...");
                transaction.executeSql("alter table rule add column specify_url_by_regexp;");
                transaction.executeSql("UPDATE rule SET specify_url_by_regexp=1;");
                transaction.executeSql("alter table rule add column user_identifier;");
                transaction.executeSql("alter table rule add column global_identifier;");
                transaction.executeSql("alter table rule add column hide_block_css;", [], function () {
                    console.log("Columns added.");
                    callback();
                }, function () {
                    console.log("DB Version-up FAILED. change version 2.0->1.0");
                    db.changeVersion("2.0", "1.0", callback);
                });
            });
            console.log("Update from ver 2.0");
        }
        else if ("1.0" == currentDbVersion || "" == currentDbVersion) {
            console.log("Update from Default (1.0 or no-version)");
            db.changeVersion(currentDbVersion, LATEST_DB_VERSION, function (transaction) {
                console.log("Adding columns...");
                transaction.executeSql("alter table rule add column specify_url_by_regexp;");
                transaction.executeSql("UPDATE rule SET specify_url_by_regexp=1;");
                transaction.executeSql("alter table rule add column user_identifier;");
                transaction.executeSql("alter table rule add column global_identifier;");
                transaction.executeSql("alter table rule add column search_block_by_css;");
                transaction.executeSql("alter table rule add column search_block_css;");
                transaction.executeSql("alter table rule add column hide_block_by_css;");
                transaction.executeSql("alter table rule add column hide_block_css;", [], function () {
                    console.log("Columns added.");
                    callback();
                }, function () {
                    console.log("DB Version-up FAILED. change version 2.0->1.0");
                    db.changeVersion("2.0", "1.0", callback);
                });
            });
        }
    }
    else {
        console.log("updateDbIfNeeded() DB schema is up to date.");
        callback();
    }
}
//# sourceMappingURL=DbInit.js.map