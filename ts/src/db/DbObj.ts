
class DbColumn {
	name:string;
	type:any;
	version:any;
	properties:any;
	
	static readonly TYPE_PKEY = 1;
	static readonly TYPE_INTEGER = 2;
	static readonly TYPE_TEXT = 3;
	static readonly TYPE_BOOLEAN = 4;
	static readonly TYPE_TIMESTAMP = 5;
	static readonly TYPE_FLOAT = 6;
	static readonly TYPE_BITFIELD = 7;
	
	static readonly LABEL_PKEY = 'INTEGER PRIMARY KEY AUTOINCREMENT';
	static readonly LABEL_INTEGER = 'INTEGER';
	static readonly LABEL_TEXT = 'TEXT';
	static readonly LABEL_BOOLEAN = 'INTEGER';
	static readonly LABEL_TIMESTAMP = 'TIMESTAMP';
	static readonly LABEL_FLOAT = 'FLOAT';
	static readonly LABEL_BITFIELD = 'INTEGER';
	
	public constructor (name:string, type, version, properties) {
		this.name = name;
		this.type = type;
		this.version = version;
		this.properties = properties;
	
	}
	getTypeString () : string {
		switch (this.type) {
			case DbColumn.TYPE_PKEY: return DbColumn.LABEL_PKEY;
			case DbColumn.TYPE_INTEGER: return DbColumn.LABEL_INTEGER;
			case DbColumn.TYPE_TEXT: return DbColumn.LABEL_TEXT;
			case DbColumn.TYPE_BOOLEAN: return DbColumn.LABEL_BOOLEAN;
			case DbColumn.TYPE_TIMESTAMP: return DbColumn.LABEL_TIMESTAMP;
			case DbColumn.TYPE_FLOAT: return DbColumn.LABEL_FLOAT;
			case DbColumn.TYPE_BITFIELD: return DbColumn.LABEL_BITFIELD;
			default : return '';
		}
	}
}

abstract class DbObject {
	dirty:boolean;
	isNew:boolean;
	deleted:boolean;
	insert_date:number;
	update_date:number;
	delete_date:number;
	constructor () {
	}
}
interface Dictionary<T> {
    [K: string]: T;
}

/**
 * Peer
 */
 abstract class DbPeer {
 	cols:DbColumn[];
 	tableName:string;
 	pkeyColName:string;
 	constructor () {
 		this.cols = [];
 	}
	public static getInstance () : DbPeer {
		return null;
	}
 	addColumn (name:string, type:number, version:number, properties:string[]/* for BITFIELD */) {
		this.cols.push(new DbColumn(name, type, version, properties));
	}
	public abstract createObject () : DbObject;
	dropTable (): void {
		let sql = 'DROP TABLE ' + this.tableName;
		try {
			db.transaction(function(tx) 
			{
				tx.executeSql(sql, [], 
				function() {
				}, 
				function() {
				});
			});
		} catch (ex) {
			console.log(ex)
		}
	}
	createTable (callback): void {
		let sql = 'CREATE TABLE IF NOT EXISTS ' + this.tableName + '(';
		let exps = new Array();
		
		for (let i=0, l=this.cols.length; i<l; i++) 
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
	}
	select (condition, onFinishCallback, onFailCallback): void {
		let sql = 'SELECT * FROM ' + this.tableName;
		if (condition && ''!=condition) {
			sql += ' WHERE ' + condition;
		}
		let self = this;
		let list:DbObject[] = []; 
		db.transaction(function(tx) {
			tx.executeSql(sql, [], 
				function(tx, res) {
				for(let i=0, l=res.rows.length;i<l; i++) {
					let _obj = self.createObject();
					let obj = _obj as object;
					for (let j=0; j<self.cols.length; j++) {
						let col = self.cols[j];
						if (col.type == DbColumn.TYPE_BOOLEAN) {
							obj[col.name] = (1==res.rows.item(i)[col.name]);
						}
						else if (col.type == DbColumn.TYPE_BITFIELD) {
							let val = res.rows.item(i)[col.name];
							for (let pIndex = 0; pIndex<col.properties.length; pIndex++) {
								let propertyName = col.properties[pIndex];
								let propertyValue = 0x01 & (val>>pIndex);
								obj[propertyName] = (1==propertyValue);
							}
						}
						else {
							obj[col.name] = res.rows.item(i)[col.name];
						}
					}
					list.push(_obj);
				}
				if (onFinishCallback) onFinishCallback(list);	
			}, 
			onFailCallback);
		});
	}
	saveObject (obj:DbObject, onSuccessCallback:(DbObject)=>void, onFailureCallback:()=>void): void {
		if (!obj.insert_date)
			obj.insert_date = new Date().getTime();
		obj.update_date = new Date().getTime();
		if (obj[this.getPkeyColName()] > 0) {
		  this.updateObject(obj, onSuccessCallback, onFailureCallback);
		} else {
		  this.insertObject(obj, onSuccessCallback, onFailureCallback);
		}
	}
	insertObject (obj:DbObject, onSuccessCallback:(DbObject)=>void, onFailureCallback:()=>void): void {
		let sql = 'INSERT INTO ' + this.tableName + ' (';
		let exps = new Array();
		let colList = new Array(); // TODO strict
		let valList = new Array(); // TODO strict
		for (let i=0, l=this.cols.length; i<l; i++) {
			let col = this.cols[i];
			if (DbColumn.TYPE_PKEY==col.type) continue;
			let val = obj[col.name];
			let valStr = '';
			if (col.type==DbColumn.TYPE_TEXT) {
				valStr = "'" + DbPeer.escape(val) + "'";
			}
			else if (col.type==DbColumn.TYPE_BOOLEAN) {
				valStr = String((val) ?1:0);
			}
			else if (col.type==DbColumn.TYPE_BITFIELD) {
				let fieldVal = 0
				for (let pIndex = 0; pIndex<col.properties.length; pIndex++) {
					let propertyName = col.properties[pIndex];
					fieldVal += (((obj[propertyName])?1:0)<<pIndex);
				}
				valStr = String(fieldVal);
			}
			else {
				valStr = String((val)?val:0);
			}
			colList.push(col.name);
			valList.push(valStr);
		}
		sql += colList.join(',');
		sql += ') VALUES (';
		sql += valList.join(',');
		sql += ')';
		let self = this;
		console.log(sql)
		try {
			db.transaction(function(tx) {
				tx.executeSql(sql, [], function(tx, res) {
					console.log("Insert Success");
					obj.dirty = false;
					obj[self.getPkeyColName()] = res.insertId;
					if (onSuccessCallback) {
						onSuccessCallback(obj);
					}
				}, 
				function(tx, res){
					console.log("Insert Failed code=" + res.code);
					console.log("Insert Failed message=" + res.message);
					if (onFailureCallback) onFailureCallback();
				});
			});
		}
		catch (ex) {
			console.log(ex)
		}
	}
	public updateObject (obj:DbObject, onSuccessCallback:(DbObject)=>void, onFailureCallback:()=>void): void {
		try {
			let sql = 'UPDATE ' + this.tableName + ' SET ';
			let exps = new Array();
			for (let i=0, l=this.cols.length; i<l; i++) {
				let col = this.cols[i];
				if (DbColumn.TYPE_PKEY==col.type) continue;
				let val = obj[col.name];
				let valStr = '';
				if (col.type==DbColumn.TYPE_TEXT) 
				{
					valStr = "'" + DbPeer.escape(val) + "'";
				}
				else if (col.type==DbColumn.TYPE_BOOLEAN)
				{
					valStr = String((val)?1:0);
				}
				else if (col.type==DbColumn.TYPE_BITFIELD)
				{
					let fieldVal = 0
					for (let pIndex = 0; pIndex<col.properties.length; pIndex++) {
						let propertyName = col.properties[pIndex];
						fieldVal += (((obj[propertyName])?1:0)<<pIndex);
					}
					valStr = String(fieldVal);
				}
				else 
				{
					valStr = String((val)?val:0);
				}
				exps.push(col.name+'='+valStr);
			}
			sql += exps.join(',');
			sql += ' WHERE ';
			sql += this.getPkeyColName();
			sql += '=';
			sql += obj[this.getPkeyColName()];
			console.log(sql);
			db.transaction(function(tx) 
			{
				tx.executeSql(sql, [], function()
				{
					console.log("Update Success");
					obj.dirty = false;
					if (onSuccessCallback) 
					{
						onSuccessCallback(obj);
					}
				}, 
				function() {
					console.log("Update Failed")
					if (onFailureCallback) onFailureCallback();
				});
			});
		} 
		catch (ex) 
		{
			console.log(ex)
		}
	}
	deleteObject (obj:DbObject, onSuccessCallback:(DbObj)=>void, onFailureCallback:()=>void): void {
		try {
			let sql = 'DELETE FROM ' + this.tableName;
			sql += ' WHERE ';
			sql += this.getPkeyColName();
			sql += '=';
			sql += obj[this.getPkeyColName()];
			db.transaction(function(tx) {
				tx.executeSql(sql, [], function() {
					console.log("Delete Success");
					obj.dirty = false;
					if (onSuccessCallback) {
						onSuccessCallback(obj);
					}
				}, function() {
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
	getPkeyColName (): string {
		if (this.pkeyColName) 
			return this.pkeyColName;
		for (let i = 0, l = this.cols.length; i < l; i++) {
			let col = this.cols[i];
			if (DbColumn.TYPE_PKEY == col.type) {
				this.pkeyColName = col.name;
				break;
			}
		}
		return this.pkeyColName;
	}
	static escape (str: string): string {
		if (str!=null) return str.replace(regexEscape,"''");
		else return "";
	 
	}
}
let regexEscape = new RegExp("'",'g');

