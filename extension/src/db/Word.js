var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var WordPeer = (function (_super) {
    __extends(WordPeer, _super);
    function WordPeer() {
        var _this = _super.call(this) || this;
        _this.tableName = 'word';
        _this.addColumn('word_id', DbColumn.TYPE_PKEY, 1.0, null);
        _this.addColumn('rule_id', DbColumn.TYPE_INTEGER, 1.0, null);
        _this.addColumn('word', DbColumn.TYPE_TEXT, 1.0, null);
        _this.addColumn('is_regexp', DbColumn.TYPE_BITFIELD, 1.0, ['is_regexp', 'is_complete_matching', 'is_case_sensitive', 'is_include_href']);
        _this.addColumn('insert_date', DbColumn.TYPE_TIMESTAMP, 1.0, null);
        _this.addColumn('update_date', DbColumn.TYPE_TIMESTAMP, 1.0, null);
        _this.addColumn('delete_date', DbColumn.TYPE_TIMESTAMP, 1.0, null);
        return _this;
    }
    WordPeer.getInstance = function () {
        if (!WordPeer.instance) {
            WordPeer.instance = new WordPeer();
        }
        return WordPeer.instance;
    };
    WordPeer.prototype.createObject = function () {
        return new Word();
    };
    return WordPeer;
}(DbPeer));
var Word = (function (_super) {
    __extends(Word, _super);
    function Word() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Word;
}(DbObject));
//# sourceMappingURL=Word.js.map