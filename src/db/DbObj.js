var db = null;
var needDbUpdate = false;
var LATEST_DB_VERSION = "3.0";
var DB_SIZE = 1024 * 1024 * 5;
try
{
	needDbUpdate = false;
	db = window.openDatabase("customblocker",LATEST_DB_VERSION,"customblocker extension", DB_SIZE);
}
catch (ex)
{
	console.log("Database Update Required." + ex);
	try
	{
		console.log("Trying to open DB 2.0");
		db = window.openDatabase("customblocker","2.0","customblocker extension", DB_SIZE);
		if (db)
		{
			needDbUpdate = true;
		}
	} catch (ex){
		console.log("Trying to open DB 1.0 ...Failed" + ex);

		try
		{
			console.log("Trying to open DB 1.0");
			db = window.openDatabase("customblocker","1.0","customblocker extension", DB_SIZE);
			if (db)
			{
				needDbUpdate = true;
			}
		} catch (ex){
			console.log("Trying to open DB 1.0 ...Failed" + ex);
			
		}
	}
}
function updateDbIfNeeded (callback)
{
	console.log("updateDbIfNeeded needDbUpdate");
	if (!db)
		db = window.openDatabase("customblocker","","customblocker extension", DB_SIZE);
	var currentDbVersion = db.version;
	if (LATEST_DB_VERSION!=currentDbVersion)
	{
		console.log("Database Update "+currentDbVersion+"->"+LATEST_DB_VERSION);
		if ("2.0"==currentDbVersion)
		{
			console.log("Update from Default (1.0 or no-version)");
			db.changeVersion(currentDbVersion, LATEST_DB_VERSION, 
					function (transaction)
					{
						console.log("Adding columns...");
						transaction.executeSql("alter table rule add column user_identifier;");
						transaction.executeSql("alter table rule add column global_identifier;");
						transaction.executeSql(
							"alter table rule add column hide_block_css;",
							[],
							function()
							{
								console.log("Columns added.");
								callback();
							},
							function()
							{
								console.log("DB Version-up FAILED. change version 2.0->1.0");
								db.changeVersion("2.0", "1.0", callback);
							}
						);
					}
				);
			console.log("Update from ver 2.0");
		}
		else if ("1.0"==currentDbVersion || ""==currentDbVersion)
		{
			console.log("Update from Default (1.0 or no-version)");
			db.changeVersion(currentDbVersion, LATEST_DB_VERSION, 
					function (transaction)
					{
						console.log("Adding columns...");
						transaction.executeSql("alter table rule add column user_identifier;");
						transaction.executeSql("alter table rule add column global_identifier;");
						transaction.executeSql("alter table rule add column search_block_by_css;");
						transaction.executeSql("alter table rule add column search_block_css;");
						transaction.executeSql("alter table rule add column hide_block_by_css;");
						transaction.executeSql(
							"alter table rule add column hide_block_css;",
							[],
							function()
							{
								console.log("Columns added.");
								callback();
							},
							function()
							{
								console.log("DB Version-up FAILED. change version 2.0->1.0");
								db.changeVersion("2.0", "1.0", callback);
							}
						);
					}
				);
		}
	}
	else
	{
		console.log("updateDbIfNeeded() DB schema is up to date.");
		callback();
	}
}
/**
 * Peer
 */
var DbPeer = function () 
{
	this.cols = new Array();
};
DbPeer.prototype = {
	addColumn: function (name, type) 
	{
		this.cols.push(new DbColumn(name,type));
	},
	dropTable: function () 
	{
		var sql = 'DROP TABLE ' + this.tableName;
		try 
		{
			db.transaction(function(tx) 
			{
				tx.executeSql(sql, [], 
				function()
				{
				}, 
				function()
				{
				});
			});
		} catch (ex) 
		{
			console.log(ex)
		}
		
	},
	createTable: function (callback) 
	{
		var sql = 'CREATE TABLE IF NOT EXISTS ' + this.tableName + '(';
		var exps = new Array();
		
		for (var i=0, l=this.cols.length; i<l; i++) 
		{
			exps.push(this.cols[i].name + ' ' + this.cols[i].getTypeString());
		}
		sql += exps.join(',');
		sql += ')';
		console.log(sql);
		try
		{
			db.transaction(function(tx) 
			{
				tx.executeSql(sql, [], function()
				{

					console.log("Create Table Success.");
					if (callback) callback();
				}, 
				function()
				{
					console.log("Create Table FAILED.");
				});
			});
		}
		catch (ex) 
		{
			console.log(ex)
		}
	},
	select: function (condition, onFinishCallback, onFailCallback) 
	{
		var sql = 'SELECT * FROM ' + this.tableName;
		if (condition && ''!=condition) 
		{
			sql += ' WHERE ' + condition;
		}
		var self = this;
		var list = new Array(); 
		db.transaction(function(tx) 
		{
			tx.executeSql(sql, [], 
				function(tx, res) 
				{
				for(var i=0, l=res.rows.length;i<l; i++)
				{
					var obj = self.createObject();
					for (var j=0; j<self.cols.length; j++) 
					{
						var col = self.cols[j];
						if (col.type == DbColumn.TYPE_BOOLEAN) 
						{
							obj[col.name] = (1==res.rows.item(i)[col.name]);
						}
						else 
						{
							obj[col.name] = res.rows.item(i)[col.name];
						}
					}
					list.push(obj)
				}
				if (onFinishCallback) onFinishCallback(list);	
			}, 
			onFailCallback);
		});
	},
	saveObject: function (obj, onSuccessCallback, onFailureCallback) 
	{
		if (obj[this.getPkeyColName()] > 0) this.updateObject(obj, onSuccessCallback, onFailureCallback);
		else this.insertObject(obj, onSuccessCallback, onFailureCallback);
	},
	insertObject: function (obj, onSuccessCallback, onFailureCallback) 
	{
		var sql = 'INSERT INTO ' + this.tableName + ' (';
		var exps = new Array();
		var colList = new Array();
		var valList = new Array();
		for (var i=0, l=this.cols.length; i<l; i++) 
		{
			var col = this.cols[i];
			if (DbColumn.TYPE_PKEY==col.type) continue;
			var val = obj[col.name];
			var valStr = '';
			if (col.type==DbColumn.TYPE_TEXT) 
			{
				valStr = "'" + DbPeer.escape(val) + "'";
			}
			else if (col.type==DbColumn.TYPE_BOOLEAN) 
			{
				valStr = (val) ?1:0;
			}
			else 
			{
				valStr = (val)?val:0;
			}
			colList.push(col.name);
			valList.push(valStr);
		}
		sql += colList.join(',');
		sql += ') VALUES (';
		sql += valList.join(',');
		sql += ')';
		var self = this;
		console.log(sql)
		try 
		{
			db.transaction(function(tx) 
			{
				tx.executeSql(sql, [], function(tx, res)
				{
					console.log("Insert Success");
					obj.dirty = false;
					obj[self.getPkeyColName()] = res.insertId;
					if (onSuccessCallback) 
					{
						onSuccessCallback(obj);
					}
				}, 
				function(tx, res)
				{
					console.log("Insert Failed code=" + res.code);
					console.log("Insert Failed message=" + res.message);
					if (onFailureCallback) onFailureCallback();
				});
			});
		}
		catch (ex) 
		{
			console.log(ex)
		}
	},
	
	updateObject: function (obj, onSuccessCallback, onFailureCallback) 
	{
		try 
		{
			var sql = 'UPDATE ' + this.tableName + ' SET ';
			var exps = new Array();
			for (var i=0, l=this.cols.length; i<l; i++) 
			{
				var col = this.cols[i];
				if (DbColumn.TYPE_PKEY==col.type) continue;
				var val = obj[col.name];
				var valStr = '';
				if (col.type==DbColumn.TYPE_TEXT) 
				{
					valStr = "'" + DbPeer.escape(val) + "'";
				}
				else if (col.type==DbColumn.TYPE_BOOLEAN)
				{
					valStr = (val) ?1:0;
				}
				else 
				{
					valStr = (val)?val:0;
				}
				exps.push(col.name+'='+valStr);
			}
			sql += exps.join(',');
			sql += ' WHERE ';
			sql += this.getPkeyColName();
			sql += '=';
			sql += obj[this.getPkeyColName()];
			db.transaction(function(tx) 
			{
				tx.executeSql(sql, [], function()
				{
					console.log("Select Success");
					obj.dirty = false;
					if (onSuccessCallback) 
					{
						onSuccessCallback(obj);
					}
				}, 
				function()
				{
					console.log("Select Failed")
					if (onFailureCallback) onFailureCallback();
				});
			});
		} 
		catch (ex) 
		{
			console.log(ex)
		}
	},
	
	deleteObject: function (obj, onSuccessCallback, onFailureCallback) 
	{
		try 
		{
			var sql = 'DELETE FROM ' + this.tableName;
			sql += ' WHERE ';
			sql += this.getPkeyColName();
			sql += '=';
			sql += obj[this.getPkeyColName()];
			db.transaction(function(tx) 
			{
				tx.executeSql(sql, [], function()
				{
					console.log("Delete Success");
					obj.dirty = false;
					if (onSuccessCallback) 
					{
						onSuccessCallback(obj);
					}
				}, function()
				{
					console.log("Delete Failed");
					if (onFailureCallback) onFailureCallback();
				});
			});
		}
		catch (ex) 
		{
			console.log(ex)
		}
	}
};
var regexEscape = new RegExp("'",'g');
DbPeer.escape = function(str) 
{
	if (str!=null) return str.replace(regexEscape,"''");
	else return "";
	 
}
DbPeer.prototype.getPkeyColName = function()
{
	if (this.pkeyColName) 
		return this.pkeyColName;
	for (var i = 0, l = this.cols.length; i < l; i++) 
	{
		var col = this.cols[i];
		if (DbColumn.TYPE_PKEY == col.type) 
		{
			this.pkeyColName = col.name;
			break;
		}
	}
	return this.pkeyColName;
};
/**
 * 
 */
var DbColumn = function (name, type) 
{
	this.name = name;
	this.type = type;
}
DbColumn.TYPE_PKEY		 = 1;
DbColumn.TYPE_INTEGER	 = 2;
DbColumn.TYPE_TEXT	 = 3;
DbColumn.TYPE_BOOLEAN	 = 4;
DbColumn.TYPE_TIMESTAMP	 = 5;
DbColumn.TYPE_FLOAT	 = 6;

DbColumn.LABEL_PKEY = 'INTEGER PRIMARY KEY AUTOINCREMENT';
DbColumn.LABEL_INTEGER = 'INTEGER';
DbColumn.LABEL_TEXT = 'TEXT';
DbColumn.LABEL_BOOLEAN = 'INTEGER';
DbColumn.LABEL_TIMESTAMP = 'TIMESTAMP';
DbColumn.LABEL_FLOAT = 'FLOAT';

DbColumn.prototype.getTypeString = function () 
{
	switch (this.type) 
	{
		case DbColumn.TYPE_PKEY: return DbColumn.LABEL_PKEY;
		case DbColumn.TYPE_INTEGER: return DbColumn.LABEL_INTEGER;
		case DbColumn.TYPE_TEXT: return DbColumn.LABEL_TEXT;
		case DbColumn.TYPE_BOOLEAN: return DbColumn.LABEL_BOOLEAN;
		case DbColumn.TYPE_TIMESTAMP: return DbColumn.LABEL_TIMESTAMP;
		case DbColumn.TYPE_FLOAT: return DbColumn.LABEL_FLOAT;
		default : return '';
	}
};

var DbObject = function() 
{
}
DbObject.prototype.save = function () 
{
	this.getPeer().save(this);
}
