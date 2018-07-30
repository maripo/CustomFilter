// New word class
class NewWord {
	word_id:number;
	rule_id:number;
	word:string;
	newWord: NewWord;
	// Flags
	
	is_regexp:boolean;
	is_complete_matching:boolean;
	is_case_sensitive:boolean;
	is_include_href:boolean;
	
	static JSON_FLAG_REGEXP: number;
	static JSON_FLAG_COMPLETE_MATCHING: number;
	static JSON_FLAG_CASE_SENSITIVE: number;
	static JSON_FLAG_INCLUDE_HREF: number;
	toJSON () : any {
		let flags = [] as [number];
		if (this.is_regexp) { flags.push(NewWord.JSON_FLAG_REGEXP); }
		if (this.is_complete_matching) { flags.push(NewWord.JSON_FLAG_COMPLETE_MATCHING); }
		if (this.is_case_sensitive) { flags.push(NewWord.JSON_FLAG_CASE_SENSITIVE); }
		if (this.is_include_href) { flags.push(NewWord.JSON_FLAG_INCLUDE_HREF); }
		
		if (flags.length > 0) {
			let obj = {};
			obj["w"] = this.word;
			obj["f"] = flags;
			return obj;
		} else {
			return this.word;
		}
	}
	// Initialize static fields
	static init () {
		NewWord.JSON_FLAG_REGEXP = 1;
		NewWord.JSON_FLAG_COMPLETE_MATCHING = 2;
		NewWord.JSON_FLAG_CASE_SENSITIVE = 3;
		NewWord.JSON_FLAG_INCLUDE_HREF = 4;
	}
}
NewWord.init();
