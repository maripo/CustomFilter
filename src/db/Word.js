/**
 * Peer
 */
var WordPeer = function () 
{
	new DbPeer();
};
WordPeer.prototype = new DbPeer();

WordPeer.getInstance = function () 
{
	if (WordPeer.instance) return instance;
	var instance = new WordPeer();
	
	instance.tableName = 'word';
	
	instance.addColumn('word_id', DbColumn.TYPE_PKEY, 1.0);
	instance.addColumn('rule_id', DbColumn.TYPE_INTEGER, 1.0);
	
	instance.addColumn('word', DbColumn.TYPE_TEXT, 1.0);
	instance.addColumn('is_regexp', DbColumn.TYPE_BITFIELD, 1.0, 
			['is_regexp', 'is_complete_matching','is_case_seneitive', 'is_include_href']);
	
	instance.addColumn('insert_date', DbColumn.TYPE_TIMESTAMP, 1.0);
	instance.addColumn('update_date', DbColumn.TYPE_TIMESTAMP, 1.0);
	instance.addColumn('delete_date', DbColumn.TYPE_TIMESTAMP, 1.0);
	WordPeer.instance = instance;
	return WordPeer.instance;
}

WordPeer.prototype.createObject = function ()
{
	return new Word();
}
/**
 * Object
 */
var Word = function()
{
};
Word.prototype.getPeer = function () 
{
	return WordPeer.getInstance();
}