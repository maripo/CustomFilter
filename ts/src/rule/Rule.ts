interface Rule {
	// Copied from legacy DbObj
	dirty:boolean;
	isNew:boolean;
	deleted:boolean;
	insert_date:number;
	update_date:number;
	delete_date:number;
	updaterId:string;

	// Copied from legacy Rule
 	words:Word[];
 	wordGroups:WordGroup[];

 	// TODO move to wrapper class!
 	hideNodes: HTMLElement[];
 	searchNodes: HTMLElement[];
 	hiddenCount:number;
 	staticXpath:any; // TODO What's this?

 	appliedWords:any[];
 	appliedWordsMap:object;
 	is_disabled:boolean;

 	rule_id:number; // Primary key
 	user_identifier:string;
 	global_identifier:string;
 	title:string;
 	url:string;
 	site_regexp:string;
 	example_url: string;

 	search_block_css:string;
 	search_block_xpath:string;
 	search_block_by_css:boolean;

 	hide_block_css:string;
 	hide_block_xpath:string;
 	hide_block_by_css:boolean;

 	block_anyway:boolean;
 	specify_url_by_regexp:boolean;
 	existing: boolean; // TODO for import/export
}
/*
  Iterate all words (single words and grouped words)
  Usage:
  eachWords(rule, (word:Word)=>{
    ...
  });
*/
const eachWords = (rule:Rule, func:(word:Word)=>void) => {
  for (let word of rule.words) {
    func(word);
  }
  for (let group of rule.wordGroups) {
    for (let word of group.words) {
      func(word);
    }
  }
}
