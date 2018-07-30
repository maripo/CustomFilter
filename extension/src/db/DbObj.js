var DbColumn = (function () {
    function DbColumn(name, type, version, properties) {
        this.name = name;
        this.type = type;
        this.version = version;
        this.properties = properties;
    }
    DbColumn.prototype.getTypeString = function () {
        switch (this.type) {
            case DbColumn.TYPE_PKEY: return DbColumn.LABEL_PKEY;
            case DbColumn.TYPE_INTEGER: return DbColumn.LABEL_INTEGER;
            case DbColumn.TYPE_TEXT: return DbColumn.LABEL_TEXT;
            case DbColumn.TYPE_BOOLEAN: return DbColumn.LABEL_BOOLEAN;
            case DbColumn.TYPE_TIMESTAMP: return DbColumn.LABEL_TIMESTAMP;
            case DbColumn.TYPE_FLOAT: return DbColumn.LABEL_FLOAT;
            case DbColumn.TYPE_BITFIELD: return DbColumn.LABEL_BITFIELD;
            default: return '';
        }
    };
    DbColumn.TYPE_PKEY = 1;
    DbColumn.TYPE_INTEGER = 2;
    DbColumn.TYPE_TEXT = 3;
    DbColumn.TYPE_BOOLEAN = 4;
    DbColumn.TYPE_TIMESTAMP = 5;
    DbColumn.TYPE_FLOAT = 6;
    DbColumn.TYPE_BITFIELD = 7;
    DbColumn.LABEL_PKEY = 'INTEGER PRIMARY KEY AUTOINCREMENT';
    DbColumn.LABEL_INTEGER = 'INTEGER';
    DbColumn.LABEL_TEXT = 'TEXT';
    DbColumn.LABEL_BOOLEAN = 'INTEGER';
    DbColumn.LABEL_TIMESTAMP = 'TIMESTAMP';
    DbColumn.LABEL_FLOAT = 'FLOAT';
    DbColumn.LABEL_BITFIELD = 'INTEGER';
    return DbColumn;
}());
var DbObject = (function () {
    function DbObject() {
    }
    return DbObject;
}());
var DbPeer = (function () {
    function DbPeer() {
        this.cols = [];
    }
    DbPeer.getInstance = function () {
        return null;
    };
    DbPeer.prototype.addColumn = function (name, type, version, properties) {
        this.cols.push(new DbColumn(name, type, version, properties));
    };
    DbPeer.prototype.dropTable = function () {
        var sql = 'DROP TABLE ' + this.tableName;
        try {
            db.transaction(function (tx) {
                tx.executeSql(sql, [], function () {
                }, function () {
                });
            });
        }
        catch (ex) {
            console.log(ex);
        }
    };
    DbPeer.prototype.createTable = function (callback) {
        var sql = 'CREATE TABLE IF NOT EXISTS ' + this.tableName + '(';
        var exps = new Array();
        for (var i = 0, l = this.cols.length; i < l; i++) {
            exps.push(this.cols[i].name + ' ' + this.cols[i].getTypeString());
        }
        sql += exps.join(',');
        sql += ')';
        console.log(sql);
        try {
            db.transaction(function (tx) {
                tx.executeSql(sql, [], function () {
                    console.log("Create Table Success.");
                    if (callback)
                        callback();
                }, function () {
                    console.log("Create Table FAILED.");
                });
            });
        }
        catch (ex) {
            console.log(ex);
        }
    };
    DbPeer.prototype.select = function (condition, onFinishCallback, onFailCallback) {
        var sql = 'SELECT * FROM ' + this.tableName;
        if (condition && '' != condition) {
            sql += ' WHERE ' + condition;
        }
        var self = this;
        var list = [];
        db.transaction(function (tx) {
            tx.executeSql(sql, [], function (tx, res) {
                for (var i = 0, l = res.rows.length; i < l; i++) {
                    var _obj = self.createObject();
                    var obj = _obj;
                    for (var j = 0; j < self.cols.length; j++) {
                        var col = self.cols[j];
                        if (col.type == DbColumn.TYPE_BOOLEAN) {
                            obj[col.name] = (1 == res.rows.item(i)[col.name]);
                        }
                        else if (col.type == DbColumn.TYPE_BITFIELD) {
                            var val = res.rows.item(i)[col.name];
                            for (var pIndex = 0; pIndex < col.properties.length; pIndex++) {
                                var propertyName = col.properties[pIndex];
                                var propertyValue = 0x01 & (val >> pIndex);
                                obj[propertyName] = (1 == propertyValue);
                            }
                        }
                        else {
                            obj[col.name] = res.rows.item(i)[col.name];
                        }
                    }
                    list.push(_obj);
                }
                if (onFinishCallback)
                    onFinishCallback(list);
            }, onFailCallback);
        });
    };
    DbPeer.prototype.saveObject = function (obj, onSuccessCallback, onFailureCallback) {
        if (!obj.insert_date)
            obj.insert_date = new Date().getTime();
        obj.update_date = new Date().getTime();
        if (obj[this.getPkeyColName()] > 0) {
            this.updateObject(obj, onSuccessCallback, onFailureCallback);
        }
        else {
            this.insertObject(obj, onSuccessCallback, onFailureCallback);
        }
    };
    DbPeer.prototype.insertObject = function (obj, onSuccessCallback, onFailureCallback) {
        var sql = 'INSERT INTO ' + this.tableName + ' (';
        var exps = new Array();
        var colList = new Array();
        var valList = new Array();
        for (var i = 0, l = this.cols.length; i < l; i++) {
            var col = this.cols[i];
            if (DbColumn.TYPE_PKEY == col.type)
                continue;
            var val = obj[col.name];
            var valStr = '';
            if (col.type == DbColumn.TYPE_TEXT) {
                valStr = "'" + DbPeer.escape(val) + "'";
            }
            else if (col.type == DbColumn.TYPE_BOOLEAN) {
                valStr = String((val) ? 1 : 0);
            }
            else if (col.type == DbColumn.TYPE_BITFIELD) {
                var fieldVal = 0;
                for (var pIndex = 0; pIndex < col.properties.length; pIndex++) {
                    var propertyName = col.properties[pIndex];
                    fieldVal += (((obj[propertyName]) ? 1 : 0) << pIndex);
                }
                valStr = String(fieldVal);
            }
            else {
                valStr = String((val) ? val : 0);
            }
            colList.push(col.name);
            valList.push(valStr);
        }
        sql += colList.join(',');
        sql += ') VALUES (';
        sql += valList.join(',');
        sql += ')';
        var self = this;
        console.log(sql);
        try {
            db.transaction(function (tx) {
                tx.executeSql(sql, [], function (tx, res) {
                    console.log("Insert Success");
                    obj.dirty = false;
                    obj[self.getPkeyColName()] = res.insertId;
                    if (onSuccessCallback) {
                        onSuccessCallback(obj);
                    }
                }, function (tx, res) {
                    console.log("Insert Failed code=" + res.code);
                    console.log("Insert Failed message=" + res.message);
                    if (onFailureCallback)
                        onFailureCallback();
                });
            });
        }
        catch (ex) {
            console.log(ex);
        }
    };
    DbPeer.prototype.updateObject = function (obj, onSuccessCallback, onFailureCallback) {
        try {
            var sql_1 = 'UPDATE ' + this.tableName + ' SET ';
            var exps = new Array();
            for (var i = 0, l = this.cols.length; i < l; i++) {
                var col = this.cols[i];
                if (DbColumn.TYPE_PKEY == col.type)
                    continue;
                var val = obj[col.name];
                var valStr = '';
                if (col.type == DbColumn.TYPE_TEXT) {
                    valStr = "'" + DbPeer.escape(val) + "'";
                }
                else if (col.type == DbColumn.TYPE_BOOLEAN) {
                    valStr = String((val) ? 1 : 0);
                }
                else if (col.type == DbColumn.TYPE_BITFIELD) {
                    var fieldVal = 0;
                    for (var pIndex = 0; pIndex < col.properties.length; pIndex++) {
                        var propertyName = col.properties[pIndex];
                        fieldVal += (((obj[propertyName]) ? 1 : 0) << pIndex);
                    }
                    valStr = String(fieldVal);
                }
                else {
                    valStr = String((val) ? val : 0);
                }
                exps.push(col.name + '=' + valStr);
            }
            sql_1 += exps.join(',');
            sql_1 += ' WHERE ';
            sql_1 += this.getPkeyColName();
            sql_1 += '=';
            sql_1 += obj[this.getPkeyColName()];
            console.log(sql_1);
            db.transaction(function (tx) {
                tx.executeSql(sql_1, [], function () {
                    console.log("Update Success");
                    obj.dirty = false;
                    if (onSuccessCallback) {
                        onSuccessCallback(obj);
                    }
                }, function () {
                    console.log("Update Failed");
                    if (onFailureCallback)
                        onFailureCallback();
                });
            });
        }
        catch (ex) {
            console.log(ex);
        }
    };
    DbPeer.prototype.deleteObject = function (obj, onSuccessCallback, onFailureCallback) {
        try {
            var sql_2 = 'DELETE FROM ' + this.tableName;
            sql_2 += ' WHERE ';
            sql_2 += this.getPkeyColName();
            sql_2 += '=';
            sql_2 += obj[this.getPkeyColName()];
            db.transaction(function (tx) {
                tx.executeSql(sql_2, [], function () {
                    console.log("Delete Success");
                    obj.dirty = false;
                    if (onSuccessCallback) {
                        onSuccessCallback(obj);
                    }
                }, function () {
                    console.log("Delete Failed");
                    if (onFailureCallback)
                        onFailureCallback();
                });
            });
        }
        catch (ex) {
            console.log(ex);
        }
    };
    DbPeer.prototype.getPkeyColName = function () {
        if (this.pkeyColName)
            return this.pkeyColName;
        for (var i = 0, l = this.cols.length; i < l; i++) {
            var col = this.cols[i];
            if (DbColumn.TYPE_PKEY == col.type) {
                this.pkeyColName = col.name;
                break;
            }
        }
        return this.pkeyColName;
    };
    DbPeer.escape = function (str) {
        if (str != null)
            return str.replace(regexEscape, "''");
        else
            return "";
    };
    return DbPeer;
}());
var regexEscape = new RegExp("'", 'g');
//# sourceMappingURL=DbObj.js.map