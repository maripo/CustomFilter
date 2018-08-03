// New word class
class Word {
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
	
	static JSON_FLAG_REGEXP: number;
	static JSON_FLAG_COMPLETE_MATCHING: number;
	static JSON_FLAG_CASE_SENSITIVE: number;
	static JSON_FLAG_INCLUDE_HREF: number;
	toSyncJSON () : any {
		let flags = [] as [number];
		if (this.is_regexp) { flags.push(Word.JSON_FLAG_REGEXP); }
		if (this.is_complete_matching) { flags.push(Word.JSON_FLAG_COMPLETE_MATCHING); }
		if (this.is_case_sensitive) { flags.push(Word.JSON_FLAG_CASE_SENSITIVE); }
		if (this.is_include_href) { flags.push(Word.JSON_FLAG_INCLUDE_HREF); }
		
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
		Word.JSON_FLAG_REGEXP = 1;
		Word.JSON_FLAG_COMPLETE_MATCHING = 2;
		Word.JSON_FLAG_CASE_SENSITIVE = 3;
		Word.JSON_FLAG_INCLUDE_HREF = 4;
	}
	initByJSON (obj: any) {
		if (typeof(obj)=="string") {
			this.word = obj as string;
		} else {
			let jsonObj = obj as object;
			this.word = jsonObj["w"];
			if (jsonObj["f"]) {
				// Flags
				let flags = jsonObj["f"] as [number];
				for (let flagNum of flags) {
					if (flagNum==Word.JSON_FLAG_REGEXP) { this.is_regexp = true; }
					if (flagNum==Word.JSON_FLAG_COMPLETE_MATCHING) { this.is_complete_matching = true; }
					if (flagNum==Word.JSON_FLAG_CASE_SENSITIVE) { this.is_case_sensitive = true; }
					if (flagNum==Word.JSON_FLAG_INCLUDE_HREF) { this.is_include_href = true; }
				}
			}
		}
	}
}
Word.init();
