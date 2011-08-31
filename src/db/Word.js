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
	
	instance.addColumn('word_id', DbColumn.TYPE_PKEY);
	instance.addColumn('rule_id', DbColumn.TYPE_INTEGER);
	
	instance.addColumn('word', DbColumn.TYPE_TEXT);
	instance.addColumn('is_regexp', DbColumn.TYPE_BOOLEAN);
	
	instance.addColumn('insert_date', DbColumn.TYPE_TIMESTAMP);
	instance.addColumn('update_date', DbColumn.TYPE_TIMESTAMP);
	instance.addColumn('delete_date', DbColumn.TYPE_TIMESTAMP);
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