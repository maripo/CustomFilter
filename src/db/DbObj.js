var db = null;
var needDbUpdate = false;
try
{
	needDbUpdate = false;
	db = window.openDatabase("customblocker","2.0","customblocker extension", 1048576);
}
catch (ex)
{
	console.log("Database Update Required." + ex);
	try
	{
		db = window.openDatabase("customblocker","1.0","customblocker extension", 1048576);
		if (db)
		{
			needDbUpdate = true;
		}
	} catch (ex){}
}
function updateDbIfNeeded (callback)
{
	if (needDbUpdate)
	{
		console.log("Database Update 1.0->2.0");
		
		db.changeVersion("1.0", "2.0", 
			function (transaction)
			{
				console.log("Adding columns...");
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
			alert(ex)
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
		try
		{
			db.transaction(function(tx) 
			{
				tx.executeSql(sql, [], function()
				{
					if (callback) callback();
				}, 
				function()
				{
					alert("Create Table FAILED.");
				});
			});
		}
		catch (ex) 
		{
			alert(ex)
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
					obj.dirty = false;
					obj[self.getPkeyColName()] = res.insertId;
					if (onSuccessCallback) 
					{
						onSuccessCallback(obj);
					}
				}, 
				function(tx, res)
				{
					if (onFailureCallback) onFailureCallback();
				});
			});
		}
		catch (ex) 
		{
			alert(ex)
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
					obj.dirty = false;
					if (onSuccessCallback) 
					{
						onSuccessCallback(obj);
					}
				}, 
				function()
				{
					alert("FAIL")
					if (onFailureCallback) onFailureCallback();
				});
			});
		} 
		catch (ex) 
		{
			alert(ex)
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
					obj.dirty = false;
					if (onSuccessCallback) 
					{
						onSuccessCallback(obj);
					}
				}, function()
				{
					if (onFailureCallback) onFailureCallback();
				});
			});
		}
		catch (ex) 
		{
			alert(ex)
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
