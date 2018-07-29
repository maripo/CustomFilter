/**
 * Peer
 */
class WordPeer extends DbPeer {
	static instance:WordPeer;
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
		if (!WordPeer.instance) {
      WordPeer.instance = new WordPeer();
		}
		return WordPeer.instance;
	}
	createObject () : DbObject {
		return new Word();
	}
}

/**
 * Object
 */
class Word extends DbObject {
	word_id:number;
	rule_id:number;
	word:string;
	is_regexp:boolean;
	
	// Saved as bitfields
	is_complete_matching:boolean;
	is_case_sensitive:boolean;
	is_include_href:boolean;
	
	// Compiled and cached
 	regExp:RegExp; 
 	
 	// TODO move to wrapper
 	checkedNodes:HTMLElement[];
	
}