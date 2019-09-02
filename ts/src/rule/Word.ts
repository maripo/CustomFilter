interface Word {
	word_id:number;
	rule_id:number;
	word:string;
	newWord: Word;
	// Flags

	is_regexp:boolean;
	is_complete_matching:boolean;
	is_case_sensitive:boolean;
	is_include_href:boolean;

	// Copied from legacy DbObj
	dirty:boolean;
	isNew:boolean;
	deleted:boolean;
	insert_date:number;
	update_date:number;
	delete_date:number;

	// Compiled and cached
 	regExp:RegExp;

 	// TODO move to wrapper
 	checkedNodes:HTMLElement[];
	label:string;
}
