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
var LegacyWordPeer = (function (_super) {
    __extends(LegacyWordPeer, _super);
    function LegacyWordPeer() {
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
    LegacyWordPeer.getInstance = function () {
        if (!LegacyWordPeer.instance) {
            LegacyWordPeer.instance = new LegacyWordPeer();
        }
        return LegacyWordPeer.instance;
    };
    LegacyWordPeer.prototype.createObject = function () {
        return new LegacyWord();
    };
    return LegacyWordPeer;
}(DbPeer));
var LegacyWord = (function (_super) {
    __extends(LegacyWord, _super);
    function LegacyWord() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LegacyWord.prototype.getWord = function () {
        if (!this.newWord) {
            this.newWord = cbStorage.createWord();
            this.newWord.word_id = this.word_id;
            this.newWord.rule_id = this.rule_id;
            this.newWord.word = this.word;
            this.newWord.is_regexp = this.is_regexp;
            this.newWord.is_complete_matching = this.is_complete_matching;
            this.newWord.is_case_sensitive = this.is_case_sensitive;
            this.newWord.is_include_href = this.is_include_href;
        }
        return this.newWord;
    };
    return LegacyWord;
}(DbObject));
//# sourceMappingURL=Word.js.map