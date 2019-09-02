/**
 * Peer
 */
class LegacyWordPeer extends DbPeer {
	static instance:LegacyWordPeer;
	private constructor () {
		super();
		this.tableName = 'word';

		this.addColumn('word_id', DbColumn.TYPE_PKEY, 1.0, null);
		this.addColumn('rule_id', DbColumn.TYPE_INTEGER, 1.0, null);

		this.addColumn('word', DbColumn.TYPE_TEXT, 1.0, null);
		this.addColumn('is_regexp', DbColumn.TYPE_BITFIELD, 1.0,
				['is_regexp', 'is_complete_matching','is_case_sensitive', 'is_include_href']);

		this.addColumn('insert_date', DbColumn.TYPE_TIMESTAMP, 1.0, null);
		this.addColumn('update_date', DbColumn.TYPE_TIMESTAMP, 1.0, null);
		this.addColumn('delete_date', DbColumn.TYPE_TIMESTAMP, 1.0, null);
	}
	public static getInstance () : DbPeer {
		if (!LegacyWordPeer.instance) {
      LegacyWordPeer.instance = new LegacyWordPeer();
		}
		return LegacyWordPeer.instance;
	}
	createObject () : DbObject {
		return new LegacyWord();
	}
}

/**
 * Object
 */
class LegacyWord extends DbObject {
	word_id:number;
	rule_id:number;
	word:string;
	is_regexp:boolean;
	newWord: Word;

	// Saved as bitfields
	is_complete_matching:boolean;
	is_case_sensitive:boolean;
	is_include_href:boolean;

	// Compiled and cached
 	regExp:RegExp;

 	// TODO move to wrapper
 	checkedNodes:HTMLElement[];
 	getWord (): Word {
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
 	}

}
