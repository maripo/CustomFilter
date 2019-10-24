class RuleExecutor {
	static blockTimeout:any;
	static blockInterval:any;
	static styleTag;
	static blockedCount:number;
	static initialize(): void {
		RuleExecutor.blockedCount = 0;
	}
	// Check if the URL filter matches the current page
	static checkRules (list:Rule[]) {
		for (let rule of list) {
			try  {
				var regex;
				if (rule.specify_url_by_regexp)  {
					regex = new RegExp(rule.site_regexp, 'i');
				} else {
					regex = new RegExp(CustomBlockerUtil.wildcardToRegExp(rule.site_regexp), 'i');
				}
				if (regex.test(location.href))  {
					rules.push(rule);
				}
			}
			catch (e)  {
				console.log(e);
			}
		}
		window.bgCommunicator.sendRequest('setApplied', {list:rules});
		if (rules.length > 0) {
			RuleExecutor.startBlocking();
		}
	}
	static startBlocking () :void {
		for (let rule of rules) {
			if (rule.block_anyway && !rule.is_disabled) {
				var cssSelector = (rule.hide_block_by_css)?
					rule.hide_block_css:CustomBlockerUtil.xpathToCss(rule.hide_block_xpath);
				if (cssSelector!=null) {
					RuleExecutor.addBlockCss(cssSelector);
					rule.staticXpath = cssSelector;
				}
			}
			// Set labels for tooltips in pop-up window
			for (let word of rule.words) {
				word.label = String(word.word);
			}
			for (let group of rule.wordGroups) {
				for (let word of group.words) {
					word.label =  String(group.name) + ">" + String(word.word);
				}
			}
			let wordIdIncr = 0;
			eachWords(rule, (word:Word)=>{
				word.word_id = wordIdIncr ++;
				if (word.is_regexp) {
					try {
						if (word.is_complete_matching) {
							// Append "^" and "$"
							var expression = (word.word.charAt(0)!='^')?"^":"";
							expression += word.word;
							expression += ((word.word.charAt(word.word.length-1)!='$')?'$':'');
							if (word.is_case_sensitive) {
								word.regExp = new RegExp(expression);
							} else {
								word.regExp = new RegExp(expression, 'i');
							}
						} else {
							if (word.is_case_sensitive) {
								word.regExp = new RegExp(word.word);
							} else {
								word.regExp = new RegExp(word.word, 'i');
							}
						}
					} catch (ex) {
						console.log("Invalid RegExp: \"" + word.word+"\"");
					}
				}
			});
		}
		let needBlocking = false;
		for (let rule of rules) {
			if (!rule.is_disabled) needBlocking = true;
		}
		if (needBlocking) {
			for (var after=50; after<250; after+=50) {
				setTimeout(RuleExecutor.execBlock, after);
			}
			RuleExecutor.blockInterval = setInterval(RuleExecutor.execBlock, 250);
			RuleExecutor.execBlock();
		}
	}
	static stopBlocking  ():void {
		if (RuleExecutor.blockTimeout) {
			clearTimeout(RuleExecutor.blockTimeout);
		}
		if (RuleExecutor.blockInterval) {
			clearInterval(RuleExecutor.blockInterval);
		}
	}
	static execBlock ():void {
		if (!needExecBlock) {
			return;
		}
		needExecBlock = false;
		if (!rules) return;
		for (let rule of rules) {
			if (!rule.is_disabled) {
				RuleExecutor.applyRule(rule, false,
					function (node:HTMLElement) {
						hiddenNodeList.add(node);
						RuleExecutor.blockedCount++;
						if (!rule.staticXpath) {
							hiddenNodeList.apply(node);
						}
					},
					false
				);
			}
		}
	}
	static applyRule (rule:Rule, ignoreHidden:boolean, onHide:(HTMLElement)=>void, isTesting:boolean) {
		var needRefreshBadge = false;
		var hideNodes = (rule.hide_block_by_css)?
				CustomBlockerUtil.getElementsByCssSelector(rule.hide_block_css)
				:
				CustomBlockerUtil.getElementsByXPath(rule.hide_block_xpath);
		var searchNodes;
		if ( (rule.search_block_by_css && CustomBlockerUtil.isEmpty(rule.search_block_css)) ||
				(!rule.search_block_by_css && CustomBlockerUtil.isEmpty(rule.search_block_xpath) )) {
			searchNodes = [];
			for (var i=0; i<hideNodes.length; i++) {
				searchNodes.push(hideNodes[i]);
			}
		} else {
			searchNodes = (rule.block_anyway)?[]:(
					(rule.search_block_by_css)?
						CustomBlockerUtil.getElementsByCssSelector(rule.search_block_css)
						:
						CustomBlockerUtil.getElementsByXPath(rule.search_block_xpath)
					);
		}
		for (let node of searchNodes) {
			// Check keywords
			if (node.getAttribute("containsNgWord")) {
				continue;
			}
			var foundWord = RuleExecutor.findWord(node, rule);
			if (foundWord != null) {
				node.containsNgWord = true;
				node.setAttribute("containsNgWord", true);
				node.setAttribute("foundWord", foundWord.word_id);
			}
		}
		for (var i = 0, l = hideNodes.length; i < l; i++) {
			var node = hideNodes[i];
			if (node.style.display=="none") {
				continue;
			}
			var shouldBeHidden = rule.block_anyway;
			var foundChild = null;
			if (!shouldBeHidden) {
				foundChild = RuleExecutor.findFlaggedChild(node, searchNodes);
				if (foundChild) {
					shouldBeHidden = true;
				}
			}
			if ((ignoreHidden||!node.hideDone) && shouldBeHidden) {
				if (!node.defaultStyles) {
					node.defaultStyles = {
						backgroundColor : node.style.backgroundColor,
						display : node.style.display
					};
				}
				node.hideDone = true;
				needRefreshBadge = true;
				rule.hiddenCount = (rule.hiddenCount)?rule.hiddenCount+1:1;
				if (foundChild) {
					if (!rule.appliedWordsMap) {
						rule.appliedWordsMap = [];
					}
					let wordId = foundChild.getAttribute("foundWord");
					if (wordId) {
						rule.appliedWordsMap[wordId] = (rule.appliedWordsMap[wordId]>0)?rule.appliedWordsMap[wordId]+1 : 1;
					}
				}
				// Exec callback
				if (onHide) {
					onHide(node);
				}
			}
			else if (isTesting && node.hideDone && !shouldBeHidden) {
				if (node.defaultStyles) {
					node.style.backgroundColor = node.defaultStyles.backgroundColor;
					node.style.display = node.defaultStyles.display;
				}
			}
		}
		for (node of searchNodes) {
			node.containsNgWord = false;
		}
		let appliedWords = [];
		for (let key in rule.appliedWordsMap) {
			appliedWords.push({word:key, count:rule.appliedWordsMap[key]});
		}
		rule.appliedWords = appliedWords;
		if (needRefreshBadge && RuleExecutor.blockedCount > 0) {
			window.bgCommunicator.sendRequest('badge', { rules:rules, count: RuleExecutor.blockedCount });
		}
	}
	static findFlaggedChild (hideNode, list) {
		for (var i=0, l=list.length; i<l; i++) {
			if (!list[i].getAttribute("containsNgWord")) {
				continue;
			}
			if (RuleExecutor.containsAsChild(hideNode, list[i])) {
				return list[i];
			}
		}
		return null;
	}
	static containsAsChild (rootNode:HTMLElement, _node:HTMLElement):boolean {
		let node = _node;
		while (node) {
			if (node == rootNode) return true;
			node = <HTMLElement>node.parentNode;
		}
		return false;
	}
	static findWord (node:HTMLElement, rule:Rule): Word {
		let foundWord:Word = null;
		try {
			var _text = node.textContent;
			if (!(_text.length>0)) {
				return null;
			}
			eachWords(rule, (word:Word)=>{
				if (!word.checkedNodes) {
					word.checkedNodes = new Array();
				}
				if (CustomBlockerUtil.arrayContains(word.checkedNodes, node)) {
					return;
				}
				word.checkedNodes.push(node);
				if (word.is_include_href) {
					var links = new Array();
					if(node.tagName=='A') {
						links.push(node);
					}
					var innerLinks = node.getElementsByTagName("A");
					for (let i=0; i<innerLinks.length; i++) {
						links.push(innerLinks[i]);
					}
					for (let link of links) {
						var url = link.href;
						if (url) {
							_text += (" " + url);
						}
					}
				}
				let text = (word.is_case_sensitive)?_text:_text.toLowerCase();
				let w = (word.is_case_sensitive)?word.word:word.word.toLowerCase();
				if (word.deleted) {
					return;
				}
				if (word.is_regexp) {
					if (word.regExp && word.regExp.test(text)) {
						foundWord = word;
						return;
					}
				}
				else {
					if (word.is_complete_matching) {
						if (text == w) {
							foundWord = word;
							return;
						}
					} else {
						if (text.indexOf(w)>-1) {
							foundWord = word;
							return;
						}
					}
				}
			});
		} catch (ex) {
			console.log("RuleEx ERROR");
			console.log(ex);
			return null;
		}
		return foundWord;
	}
	static addBlockCss (xpath:string) {
		if (RuleExecutor.styleTag==null) {
			RuleExecutor.styleTag = document.createElement('STYLE');
			RuleExecutor.styleTag.type = 'text/css';
			document.getElementsByTagName('HEAD')[0].appendChild(RuleExecutor.styleTag);
		}
		RuleExecutor.styleTag.innerHTML = RuleExecutor.styleTag.innerHTML + (xpath + '{display:none;}');
	}
}

RuleExecutor.initialize();
/*
	Convert XPath to CSS and add <style> tag in the header
 */

// TODO move
let rules:Rule[];

interface NodeContainer {
	node:HTMLElement;
	origValue:string;

}
class StyleProcessor {
	attribute:string;
	attributeJs:string;
	value:string;
	nodes:NodeContainer[]; // TODO rename it. It's confusing!
	constructor (attribute:string, attributeJs:string, value:string) {
		this.attribute = attribute;
		this.attributeJs = attributeJs;
		this.value = value;
		this.nodes = [];
	}
	add  (node:HTMLElement) {
		// Ignore duplicate node
		if (CustomBlockerUtil.arrayContains(this.nodes, node)) {
			return;
		}
		let origValue = getComputedStyle(node, null).getPropertyValue(this.attribute);
		this.nodes.push({node:node, origValue:origValue});
	}
	apply (node:HTMLElement) {
		node.style[this.attributeJs] = this.value;
	}
	applyStyles () {
		for (var i=0, l=this.nodes.length; i<l; i++) {
			this.nodes[i].node.style[this.attributeJs] = this.value;
		}
	}
	restoreStyles () {
		for (var i=0, l=this.nodes.length; i<l; i++) {
			this.nodes[i].node.style[this.attributeJs] = this.nodes[i].origValue;
		}
	}
}

let hiddenNodeList = new StyleProcessor("display", "display", "none");
let testNodeList = new StyleProcessor("background-color", "backgroundColor", "#888");
