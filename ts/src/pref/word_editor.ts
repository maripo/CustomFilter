class WordEditor {
	// TODO deleteWordHandler
	deleteWordHandler: (Word)=>void
	addWordHandler: (Word)=>void
	
	constructor () {
		let addWordButton = document.getElementById('rule_editor_add_keyword_button') as HTMLInputElement;
		addWordButton.addEventListener('click', this.getAddWordAction(), true);
		document.getElementById('rule_editor_keyword').addEventListener('keydown', this.getAddWordByEnterAction(), true);
		WordEditor.changeKeywordColor(null);
		document.getElementById('rule_editor_keyword_complete_matching_checkbox').addEventListener('click',WordEditor.changeKeywordColor, false);
	}
	
	getWordElement (word: Word) : HTMLElement {
		let span = document.createElement('SPAN');
		let suffix = word.is_complete_matching? 'red':'blue';
		if (word.is_regexp) {
			span.appendChild(CustomBlockerUtil.createKeywordOptionIcon("keyword_regexp",suffix,"regex"));
		}
		if (word.is_case_sensitive) {
			span.appendChild(CustomBlockerUtil.createKeywordOptionIcon("keyword_case_sensitive",suffix,"case_sensitive"));
		}
		if (word.is_include_href) {
			span.appendChild(CustomBlockerUtil.createKeywordOptionIcon("keyword_include_href",suffix,"include_href"));
		}
		span.innerHTML += CustomBlockerUtil.escapeHTML(word.word);
		span.className = 'word word--' 
			+ ((word.is_complete_matching)?'complete-matching':'not-complete-matching');
		let deleteButton = CustomBlockerUtil.createDeleteButton();
		deleteButton.addEventListener('click', this.getDeleteWordAction(word, span), true);
		
		span.appendChild(deleteButton);
		
		return span;
	}
	setWords (words:[Word]) {
    document.getElementById('rule_editor_keywords').innerHTML = '';
		for (let word of words) {
			document.getElementById('rule_editor_keywords').appendChild(this.getWordElement(word));
		}
	}
	getDeleteWordAction (word:Word, span:HTMLElement): ()=>void {
		let self = this;
		return function () {
			span.parentNode.removeChild(span);
			if (self.deleteWordHandler) {
				self.deleteWordHandler(word);
			} else {
				console.warn("deleteWordHandler is null.");
			}
		}
	}
	getAddWordByEnterAction (): (Event)=>void {
		let self = this;
		return function (event) {
			if (13==event.keyCode) {
				self.addWord();
			}
		}
	}
	
	getAddWordAction (): ()=>void {
		let self = this;
		return function () {
			self.addWord();
		}
	}
	
	addWord (): void {
		let self = this;
		let str = (document.getElementById('rule_editor_keyword') as HTMLInputElement).value;
		if (!str || ''==str) {
			return;
		}
		let word = cbStorage.createWord();
		word.word = str;
		word.is_regexp = 
			(document.getElementById('rule_editor_keyword_regexp_checkbox') as HTMLInputElement).checked;
		word.is_complete_matching = 
			(document.getElementById('rule_editor_keyword_complete_matching_checkbox') as HTMLInputElement).checked;
		word.is_case_sensitive = 
			(document.getElementById('rule_editor_keyword_case_sensitive_checkbox') as HTMLInputElement).checked;
		word.is_include_href = 
			(document.getElementById('rule_editor_keyword_include_href_checkbox') as HTMLInputElement).checked;
		
		if (this.addWordHandler) {
			this.addWordHandler(word);
		} else {
			console.warn("addWordHandler is null.");
		}
		document.getElementById('rule_editor_keywords').appendChild(self.getWordElement(word));
		(document.getElementById('rule_editor_keyword') as HTMLInputElement).value = '';
	}
	static changeKeywordColor (sender) {
		document.getElementById('rule_editor_keyword').style.backgroundColor =
			((document.getElementById('rule_editor_keyword_complete_matching_checkbox') as HTMLInputElement).checked)?'#fed3de!important':'#cdedf8!important';
	}
}